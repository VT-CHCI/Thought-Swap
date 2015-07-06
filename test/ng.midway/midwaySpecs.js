describe('Midway: Testing Modules', function() {
	describe("App Module:", function() {

    var module;
    before(function() {
      module = angular.module("app");
    });

    it("should be registered", function() {
      expect(module).not.to.equal(null);
    });

    describe("Dependencies:", function() {

      var deps;
      var hasModule = function(m) {
        return deps.indexOf(m) >= 0;
      };
      before(function() {
        deps = module.value('app').requires;
      });

      // TODO:
      // it("should have App.Controllers as a dependency", function() {
      //   expect(hasModule('App.Controllers')).to.equal(true);
      // });

      // it("should have App.Directives as a dependency", function() {
      //   expect(hasModule('App.Directives')).to.equal(true);
      // });

      // it("should have App.Filters as a dependency", function() {
      //   expect(hasModule('App.Filters')).to.equal(true);
      // });

      // it("should have App.Routes as a dependency", function() {
      //   expect(hasModule('App.Routes')).to.equal(true);
      // });

      // it("should have App.Services as a dependency", function() {
      //   expect(hasModule('App.Services')).to.equal(true);
      // });
      // 
      // TODO: Testing Routes
      //               Requests
      //               Controllers
      //               Services
      //               etc...
      // more info here:           
      // http://www.yearofmoo.com/2013/01/full-spectrum-testing-with-angularjs-and-karma.html
    });
  });
});
