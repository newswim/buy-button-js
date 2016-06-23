import morphdom from 'morphdom';
import merge from 'deepmerge';
import componentDefaults from '../defaults/components';
import Iframe from './iframe';
import View from './view';

export default class Component {
  constructor(config, props, type) {
    this.id = config.id;
    this.type = type;
    this.config = merge(componentDefaults, config.options);
    this.props = props;
    this.model = {};
    this.iframe = this.options.iframe ? new Iframe(this.el) : null;
    this.view = new View(this.templates, this.contents);
    this.children = null;
  }

  get client() {
    return this.props.client;
  }

  get options() {
    return this.config[this.type];
  }

  get templates() {
    return this.options.templates;
  }

  get contents() {
    return this.options.contents;
  }

  get styles() {
    return this.options.styles;
  }

  get document() {
    return this.iframe ? this.iframe.document : document;
  }

  get el() {
    return this.config.node || document.getElementsByTagName('script')[0];
  }

  get events() {
    return Object.assign({}, this.options.events, {

    });
  }

  delegateEvents() {
    Object.keys(this.events).forEach(key => {
      const [eventName, selector] = key.split(' ');
      this._on(eventName, selector, (evt) => {
        this.events[key].call(this, evt, this);
      });
    });
  }

  init(data) {
    this.model = data;
    this.render();
    this.delegateEvents();
  }

  initFetch() {
    return this.fetch().then(data => {
      this.model = data;
      this.render();
      this.delegateEvents();
    });
  }

  render(children = '') {
    const viewData = Object.assign({}, this.model, {
      children_html: children
    });

    const html = this.view.html({data: viewData});
    if (this.wrapper && this.wrapper.innerHTML.length) {
      const div = this.document.createElement('div');
      div.innerHTML = html;
      morphdom(this.wrapper, div);
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
  }

  createWrapper() {
    const wrapper = this.document.createElement('div');
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.el.appendChild(wrapper);
    }
    return wrapper;
  }

  _on(eventName, selector, fn) {
    this.wrapper.addEventListener(eventName, (evt) => {
      const possibleTargets = this.wrapper.querySelectorAll(selector);
      const target = evt.target;
      [...possibleTargets].forEach(possibleTarget => {
        let el = target;
        while(el && el !== this.wrapper) {
          if (el === possibleTarget) {
            return fn.call(possibleTarget, event);
          }
          el = el.parentNode;
        }
      });
    });
  }
}
