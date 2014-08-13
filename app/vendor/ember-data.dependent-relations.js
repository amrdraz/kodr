/**
  Ember Data: Dependent Relationships

  This package extends Ember Data to support creating relationships
  where a model's dirty state depends not only on its own attributes
  but on the dirty state of models in dependent relationships as well.

  ```javascript
  App.Thing = DS.Model.extend({
    name     : DS.attr('string'),
    children : DS.hasMany('thing', { dependent: true })
  });

  // Load all the things

  var thing = store.findById('thing', '1');
  var child = thing.get('children.firstObject');

  thing.get('isDirty'); // false
  child.get('name'); // 'foo'

  child.set('name', 'bar');
  thing.get('isDirty'); // true

  thing.rollback();
  child.get('name'); // 'foo'
  ```

  Note that saving dependent relations automatically, and handling
  'isValid' state based on dependent relations is not supported.
*/
(function() {
  var get = Ember.get;
  var set = Ember.set;

  //
  // State machine handlers
  //

  // Object/array agnostic 'isDirty' check
  var isRelationDirty = function(value) {
    return Ember.isArray(value) ? Ember.A(value).isAny('isDirty') : get(value, 'isDirty');
  };

  // The new de facto check to determine if a record is dirty
  var isRecordDirty = function(record) {
    // First check normal attributes
    if (Ember.keys(record._attributes).length) {
      return true;
    }

    // Then check dependent relations
    return Ember.A(Ember.keys(record._dependentRelations)).any(function(key) {
      var value = get(record, key).toArray();
      var originalValue = record._dependentRelations[key];

      return Ember.compare(value, originalValue) !== 0 || isRelationDirty(value);
    });
  };

  // A dependent relation can change if:
  //   * a belongsTo gets changed to another record
  //   * a belongsTo record dirties/cleans
  //   * a hasMany array gets added to or removed from
  //   * a hasMany array has a record that dirties/cleans
  var dependentRelationDidChange = function(record, context) {
    if (Ember.compare(context.value, context.originalValue) !== 0 || isRelationDirty(context.value)) {
      record.send('becomeDirty');
    } else {
      record.send('propertyWasReset', context.name);
    }
  };

  // The check for whether the record is still dirty now has to account for dependent relations
  var propertyWasReset = function(record, name) {
    if (!isRecordDirty(record)) {
      record.send('rolledBack');
    }
  };

  // Check to see if the saved record is dirty
  var savedSetup = function(record) {
    if (isRecordDirty(record)) {
      record.adapterDidDirty();
    }
  };

  //
  // Perform some state machine surgery
  // TODO: figure out how to make this less ass
  //

  // Handle dependent relationship change
  DS.RootState.loaded.dependentRelationDidChange = dependentRelationDidChange;

  // Changes to dependent relations while in-flight, invalid, or deleted should not alter its state
  DS.RootState.loaded.created.inFlight.dependentRelationDidChange = Ember.K;
  DS.RootState.loaded.updated.inFlight.dependentRelationDidChange = Ember.K;
  DS.RootState.loaded.created.invalid.dependentRelationDidChange = Ember.K;
  DS.RootState.loaded.updated.invalid.dependentRelationDidChange = Ember.K;
  DS.RootState.deleted.dependentRelationDidChange = Ember.K;

  // Override the property reset handler to account for dependent relations
  DS.RootState.loaded.created.uncommitted.propertyWasReset = propertyWasReset;
  DS.RootState.loaded.updated.uncommitted.propertyWasReset = propertyWasReset;

  // Handle the case when a record that is in the 'root.deleted.uncommitted' state
  // is rolled back but has dirty dependent relations
  DS.RootState.loaded.saved.setup = savedSetup;

  //
  // Modify DS.Model
  //

  // Add dependent property helpers
  DS.Model.reopenClass({
    // Loop over each dependent relation, passing the property name and the relationship meta
    eachDependentRelation: function(callback, binding) {
      get(this, 'relationshipsByName').forEach(function(name, relationship) {
        if (relationship.options.dependent) {
          callback.call(binding, name, relationship);
        }
      });
    }
  });

  DS.Model.reopen(Ember.Comparable, {
    // Initialize dependent relation snapshot object
    _setup: function() {
      this._super();
      this._dependentRelations = {};
    },

    // Loop over each dependent property
    eachDependentRelation: function(callback, binding) {
      this.constructor.eachDependentRelation(callback, binding);
    },

    // Hook into the object creation lifecycle in order to add dirty observers
    didDefineProperty: function(proto, key, value) {
      this._super(proto, key, value);

      if (value instanceof Ember.Descriptor) {
        var meta = value.meta();

        if (meta.isRelationship && meta.options.dependent) {
          if (meta.kind === 'belongsTo') {
            Ember.addObserver(proto, key + '.isDirty', null, 'dependentRelationDidChange');
          } else if (meta.kind === 'hasMany') {
            Ember.addObserver(proto, key + '.@each.isDirty', null, 'dependentRelationDidChange');
          }
        }
      }
    },

    // Dependent relation observers also must be suspended
    suspendRelationshipObservers: function(callback, binding) {
      var record = this;
      var relationshipNames = get(this.constructor, 'relationshipNames');
      var originalCallback = callback;
      var observers = [];

      // Modify the relation names to match the observer actual keys
      relationshipNames.belongsTo.forEach(function(name) {
        observers.push(name + '.isDirty');
      });
      relationshipNames.hasMany.forEach(function(name) {
        observers.push(name + '.@each.isDirty');
      });

      // Wrap the callback with another layer of suspended observers
      callback = function() {
        var self = this;
        Ember._suspendObservers(record, observers, null, 'dependentHasManyDidChange', function() {
          originalCallback.call(self);
        });
      };

      this._super(callback, binding);
    },

    // Observer for relation change, should send state machine message 'dependentRelationDidChange'
    dependentRelationDidChange: Ember.immediateObserver(function(record, key) {
      var dependentRelations = record._dependentRelations;
      var name = key.split('.')[0];

      if (name in dependentRelations) {
        var value = get(record, name);

        // Make DS.ManyArray into a vanilla array for comparison with original
        if (Ember.isArray(value)) {
          value = value.toArray();
        }

        record.send('dependentRelationDidChange', {
          name          : name,
          value         : value,
          originalValue : dependentRelations[name],
        });
      }
    }),

    // Update the dependent relations when the adapter loads new data
    adapterDidCommit: function() {
      this.snapshotDependentRelations();
      this._super.apply(this, arguments);
    },

    // When the record is loaded/saved, save its relations so they can be reverted
    snapshotDependentRelations: function() {
      var record = this;
      var dependentRelations = record._dependentRelations;
      var relation;

      record.eachDependentRelation(function(name, relationship) {
        // At different points in the record's lifecycle, either `_data` or `_relationships` will
        // contain the records we want to snapshot
        if (relation = record._data[name] || record._relationships) {
          dependentRelations[name] = relationship.kind === 'belongsTo' ? relation : relation.toArray();
        }
      });
    }.on('didLoad'),

    // Dependent relations rely on the 'isDirty' CP, which may not get called
    precomputeIsDirty: function() {
      get(this, 'isDirty');
    }.on('init'),

    // Rollback relations as well as attributes
    rollback: function() {
      // Revert attributes like normal
      this._super();

      var record = this;
      var dependentRelations = this._dependentRelations;

      // Relationship observers must be suspended so that any validation
      // observers do not fire partway through setting fields
      record.suspendRelationshipObservers(function() {
        record.eachDependentRelation(function(name, relationship) {
          if (name in dependentRelations) {
            var originalRelation = dependentRelations[name];

            if (relationship.kind === 'belongsTo') {
              set(record, name, originalRelation);
            } else {
              get(record, name).setObjects(originalRelation);
            }

            // Rollback child/field records that have changed as well
            Ember.makeArray(originalRelation).filterBy('isDirty').invoke('rollback');
          }
        });
      });
    },

    // Basic identity comparison to allow `Ember.compare` to work on models
    compare: function(r1, r2) {
      return r1 === r2 ? 0 : 1;
    },
  });
}());