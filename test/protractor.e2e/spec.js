describe('Protractor ThoughtSwap Index Test', function() {
  it('should have a title', function() {
    browser.get('http://localhost/');

    expect(browser.getTitle()).toEqual('ThoughtSwap');
  });
});