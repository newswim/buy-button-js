import ShopifyBuy from '../../src/buybutton';
import Component from '../../src/component';
import Iframe from '../../src/iframe';
import Template from '../../src/template';

import componentDefaults from '../../src/defaults/components';

const config = {
  id: 123,
  node: document.getElementById('fixture'),
  options: {
    product: {
      iframe: false,
      styles: {
        product: {
          'background': 'red',
        }
      },
      templates: {
        button: '<button id="button" class="button">Fake button</button>'
      },
      contents: {
        title: true,
        button: true,
      }
    },
    option: {
      styles: {
        option: {
          'background': 'blue',
        }
      },
    }
  }
}

let component;
let scriptNode;

describe('Component class', () => {
  beforeEach(() => {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
    Component.prototype.typeKey = 'product'
    component = new Component(config, {client: {},
      browserFeatures: {
        transition: true,
        animation: true,
        transform: true,
      }
    });
  });

  afterEach(() => {
    component = null;
    document.body.removeChild(config.node);
    config.node = null;
  });

  describe('constructor', () => {
    it('merges configuration options and defaults', () => {
      assert.equal(component.config.product.templates.button, config.options.product.templates.button);
      assert.equal(component.config.product.buttonDestination, 'cart');
    });

    it('proxies commonly accessed attributes to config options for type', () => {
      assert.isOk(component.client);
      assert.equal(component.options.iframe, config.options.product.iframe);
    });

    it('instantiates a template', () => {
      assert.isOk(component.template instanceof Template);
    });
  });

  describe('get classes', () => {
    it('returns classes based on manifest', () => {
      assert.equal(component.classes.product.product, componentDefaults.product.classes.product);
      assert.equal(component.classes.option.option, componentDefaults.option.classes.option);
    });
  });

  describe('get classes', () => {
    it('returns classes formatted as selectors based on manifest', () => {
      assert.equal(component.selectors.product.product, '.shopify-buy__product');
      assert.equal(component.selectors.option.option, '.shopify-buy__option-select');
    });
  });

  describe('get styles', () => {
    it('returns classes based on manifest', () => {
      assert.deepEqual(component.styles.product.product, config.options.product.styles.product);
      assert.deepEqual(component.styles.option.option, config.options.option.styles.option);
    });
  });

  describe('init', () => {
    it('fetches and renders data', () => {
      const setupView = sinon.stub(component, 'setupView').returns(Promise.resolve());
      const setupModel = sinon.stub(component, 'setupModel').returns(Promise.resolve({ title: 'test' }));
      const render = sinon.stub(component, 'render');
      const delegateEvents = sinon.stub(component, 'delegateEvents');

      return component.init().then(() => {
        assert.deepEqual(component.model, {title: 'test'});
        assert.calledOnce(setupView);
        assert.calledOnce(setupModel);
        assert.calledOnce(render);
        assert.calledOnce(delegateEvents);
      });
    });

    describe('with data passed as arg', () => {
      it('sets model to data', () => {
        return component.init({title: 'test'}).then(() => {
          assert.equal('test', component.model.title);
        });
      });
    });

    describe('with no data passed as arg', () => {
      it('fetches data and sets model', () => {
        component.fetchData = sinon.stub().returns(Promise.resolve({title: 'rectangle'}));;
        return component.init().then(() => {
          assert.equal('rectangle', component.model.title);
        });
      });
    });

    it('adds event listeners to nodes', () => {
      const clickSpy = sinon.spy();
      const testConfig = Object.assign({}, config);
      testConfig.options.product.DOMEvents = {
        'click .button': clickSpy
      }
      const testComponent = new Component(testConfig, {client: {}, imageCache: {}});
      return testComponent.init({}).then(() => {
        testComponent.render();
        testComponent.delegateEvents();
        testComponent.document.getElementById('button').click();
        assert.calledWith(clickSpy, sinon.match.instanceOf(Event), sinon.match.instanceOf(window.Node));
      });
    });

    describe('if iframe is true', () => {
      it('creates an iframe', () => {
        const iframeComponent = new Component({
          node: document.getElementById('fixture'),
          id: 123,
          options: { product: {iframe: true}}}, {client: {},
            browserFeatures: {
              transition: true,
              animation: true,
              transform: true,
            }
          },
          'product');
        const setupModel = sinon.stub(iframeComponent, 'setupModel').returns(Promise.resolve({ title: 'test' }));
        return iframeComponent.init().then(() => {
          assert.isOk(iframeComponent.iframe);
          setupModel.restore();
        });
      });
    });
  });

  describe('updateConfig', () => {
    it('updates config with passed options', () => {
      const updateConfig = {
        id: 123,
        options: {
          product: {
            styles: {
              button: {
                'color': 'blue'
              }
            },
          }
        }
      }
      component.updateConfig(updateConfig);
      assert.equal(component.options.styles.button.color, 'blue');
    });
  });

  describe('render', () => {
    it('sets innerHTML of wrapper on initial call', () => {
      const testHTML = '<h1>THIS IS ONLY A TEST</h1>';

      const tmplRender = sinon.stub(component.template, 'render').returns(`<div>${testHTML}</div>`);
      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });

    it('updates innerHTML of wrapper on second call', () => {
      const testBeforeHTML = '<h1>THIS IS ONLY A TEST</h1>';
      const testHTML = '<h1>THIS IS NOT A TEST</h1>'
      const tmplRender = sinon.stub(component.template, 'render').returns(`<div>${testHTML}</div>`);
      component.wrapper = component._createWrapper();
      component.wrapper.innerHTML = testBeforeHTML;
      component.render();
      assert.equal(component.wrapper.innerHTML, testHTML);
    });
  });

  describe('renderChild', () => {
    let updateNodeSpy;
    let childNode;

    beforeEach(() => {
      const contents = {
        title: true,
      }
      const templates = {
        title: '<h1>BUY MY BUTTONS {{data.name}}</h1>',
      }
      const order = ['title'];
      const template = new Template(templates, contents, order);
      updateNodeSpy = sinon.stub(component, 'updateNode');
      childNode = document.createElement('div');
      childNode.className = 'foo';
      component.model.name = 'lol';
      component.wrapper = component._createWrapper();
      component.wrapper.appendChild(childNode);
      component.renderChild('foo', template);
    });

    it('calls updateNode with node and html', () => {
      assert.calledWith(updateNodeSpy, childNode, '<h1>BUY MY BUTTONS lol</h1>');
    });
  });

  describe('updateNode', () => {
    it('updates contents of node', () => {
      const div = document.createElement('div');
      div.innerHTML = '<h1>OLD TEXT</h1>';
      const html = '<h1>SO FRESH</h1>';
      component.updateNode(div, `<div>${html}</div>`);
      assert.equal(div.innerHTML, html);
    });
  });


  describe('wrapTemplate', () => {
    describe('when button exists', () => {
      it('puts strings in a div', () => {
        const string = component.wrapTemplate('test');
        assert.equal(string, '<div class="shopify-buy__product">test</div>');
      });
    });
  });
});
