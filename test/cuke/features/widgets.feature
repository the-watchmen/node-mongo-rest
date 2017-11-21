Feature: widgets

  Background:
    Given the following documents exist in the 'widgets' collection:
    """
    [
      {
        _id: 'w1',
        name: 'widget one',
        created: {
          user: {
            _id: '321',
            name: 'jane doe'
          }
        },
        updated: {
          user: {
            _id: '321',
            name: 'jane doe'
          }
        }
      },
      {
        _id: 'w2',
        name: 'widget two'
      }
    ]
    """
    And the following indices exist on the 'widgets' collection:
    """
    [
      [{'name': 1}, {unique: true}]
    ]
    """
    And we set the following HTTP headers:
    """
    {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaHIiLCJ1c2VySWQiOiIxMjMiLCJ1c2VyTmFtZSI6ImpvaG4gZG9lIiwiY2xpZW50SWQiOiJjMSJ9._CjFrsNP_jCLg1M24-W6POjp4Z8LNd7pQD2irXYlJok'
    }
    """

  Scenario: find widgets
    When we HTTP GET '/widgets'
    Then our HTTP response should be like:
    """
    [
      {_id: 'w1', name: 'widget one'},
      {_id: 'w2', name: 'widget two'}
    ]
    """

  Scenario: get widget
    When we HTTP GET '/widgets/w1'
    Then our HTTP response should be like:
    """
      {_id: 'w1', name: 'widget one'}
    """

  Scenario: get non-existent client
    When we HTTP GET '/widgets/nope'
    Then our HTTP response should have status code 404

  Scenario: create widget
    When we HTTP POST '/widgets' with body:
    """
    {_id: 'w3', name: 'widget three'}
    """
    Then our HTTP response should have status code 201
    And our HTTP headers should include 'location'
    And mongo query "{name: 'widget three'}" on 'widgets' should be like:
    """
    [
      {
        _id: 'w3',
        name: 'widget three',
        created: {
          user: {
            _id: '123',
            name: 'john doe'
          },
          date: 'assert(actual.constructor.name == "Date")'
        },
        updated: {
          user: {
            _id: '123',
            name: 'john doe'
          },
          date: 'assert(actual.constructor.name == "Date")'
        }
      }
    ]
    """

  Scenario: create invalid widget
    When we HTTP POST '/widgets' with body:
    """
    {nayme: 'widget four'}
    """
    Then our HTTP response should have status code 422

  Scenario: create duplicate widget
    When we HTTP POST '/widgets' with body:
    """
    {name: 'widget one'}
    """
    Then our HTTP response should have status code 409

  Scenario: update widget
    When we HTTP PUT '/widgets/w1' with body:
    """
    {name: 'widget won'}
    """
    Then our HTTP response should have status code 204
    And mongo query "{_id: 'w1'}" on 'widgets' should be like:
    """
    [
      {
        _id: 'w1',
        name: 'widget won',
        created: {
          user: {
            _id: '321',
            name: 'jane doe'
          }
        },
        updated: {
          user: {
            _id: '123',
            name: 'john doe'
          },
          date: 'assert(actual.constructor.name == "Date")'
        }
      }
    ]
    """
    And mongo query "{}" on 'widgetsHistory' should be like:
    """
    [
      {
        user: {
          _id: '123',
          name: 'john doe'
        },
        mode: constants.MODES.update,
        date: 'assert(actual.constructor.name == "Date")',
        data: {
          _id: 'w1',
          name: 'widget one'
        }
      }
    ]
    """

  Scenario: update invalid widget
    When we HTTP PUT '/widgets/w2' with body:
    """
    {nayme: 'widget too'}
    """
    Then our HTTP response should have status code 422

  Scenario: update duplicate widget
    When we HTTP PUT '/widgets/w2' with body:
    """
    {name: 'widget one'}
    """
    Then our HTTP response should have status code 409

  Scenario: update non-existent widget
    When we HTTP PUT '/widgets/nope' with body:
    """
    {name: 'nope'}
    """
    Then our HTTP response should have status code 404

  Scenario: delete widget
    When we HTTP DELETE '/widgets/w2'
    Then our HTTP response should have status code 204
    And mongo query "{_id: 'w2'}" on 'widgets' should be like:
    """
    []
    """
    And mongo query "{}" on 'widgetsHistory' should be like:
    """
    [
      {
        mode: constants.MODES.delete,
        date: 'assert(actual.constructor.name == "Date")',
        data: {
          _id: 'w2',
          name: 'widget two'
        }
      }
    ]
    """

  Scenario: delete non-existent widget
    When we HTTP DELETE '/widgets/nope'
    Then our HTTP response should have status code 404
