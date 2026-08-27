using CinemaMVC.Web.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace CinemaMVC.Tests
{
    /// <summary>
    /// Unit tests for the global model-state validation filter.
    /// </summary>
    public class ValidateModelStateAttributeTests
    {
        private static ActionExecutingContext CreateContext()
        {
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor());

            return new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object?>(),
                controller: new object());
        }

        [Fact]
        public void OnActionExecuting_ShouldSetBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var context = CreateContext();
            context.ModelState.AddModelError("id", "The value 'abc' is not valid.");
            var filter = new ValidateModelStateAttribute();

            // Act
            filter.OnActionExecuting(context);

            // Assert
            Assert.IsType<BadRequestResult>(context.Result);
        }

        [Fact]
        public void OnActionExecuting_ShouldLeaveResultNull_WhenModelStateIsValid()
        {
            // Arrange
            var context = CreateContext();
            var filter = new ValidateModelStateAttribute();

            // Act
            filter.OnActionExecuting(context);

            // Assert
            Assert.Null(context.Result);
        }
    }
}
