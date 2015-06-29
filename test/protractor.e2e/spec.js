describe('Protractor ThoughtSwap Index Test', function() {
  it('should have a title', function() {
    browser.get('http://localhost:3030/#/');

    expect(browser.getTitle()).toEqual('ThoughtSwap');
  });
});