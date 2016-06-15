const cartTemplate = {
  title: '<div class="cart-section cart-section--top">' +
           '<h2 class="cart-title">{{data.title}}</h2>' +
            '<button class="btn--close">' +
              '<span aria-role="hidden">×</span>' +
              '<span class="visuallyhidden">Close</span>' +
            '</button>' +
          '</div>',
  items: '<div data-include></div>',
  total: '<div class="cart-info__pricing">' +
            '<span class="cart-info__small cart-info__total">CAD</span>' +
            '<span class="pricing pricing--no-padding">{{data.subtotal}}</span>' +
          '</div>',
  checkout: '<input type="submit" class="btn btn--cart-checkout" id="checkout" name="checkout" value="Checkout">'
}

export default cartTemplate;