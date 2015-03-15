jest.dontMock('../UnreadThreadStore');

describe('UnreadThreadStore', function() {

  var alt;
  var callback;
  var UnreadThreadStore;

  beforeEach(function() {
    alt = require('../../alt');
    alt.dispatcher = { register: jest.genMockFunction() };
    UnreadThreadStore = require('../UnreadThreadStore');
    callback = alt.dispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(alt.dispatcher.register.mock.calls.length).toBe(1);
  });

  it('provides the unread thread count', function() {
    var ThreadStore = require('../ThreadStore');
    ThreadStore.getAll.mockReturnValueOnce(
      {
        foo: {lastMessage: {isRead: false}},
        bar: {lastMessage: {isRead: false}},
        baz: {lastMessage: {isRead: true}}
      }
    );
    expect(UnreadThreadStore.getCount()).toBe(2);
  });

});
