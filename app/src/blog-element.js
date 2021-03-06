import {LitElement, css} from 'lit-element';
import './blog-network-warning.js';

/**
 * BlogElement
 */
export default class BlogElement extends LitElement {
  static get properties() {
    return {
      failure: {
        type: Boolean,
        attribute: false,
      },
      metadata: {
        type: Object,
        attribute: false,
      },
      share: {
        type: Object,
        attribute: false,
      },
      loaded: {
        type: Boolean,
        attribute: false,
      },
      __domRefs: {
        type: Object,
        attribute: false,
      }
    };
  }

  constructor() {
    super();

    this.metadata = {
      posts: [],
      article: '',
      title: '',
      dataModified: '',
      date: '',
      readingtime: '',
      permalink: '',
      description: '',
      filename: '',
      view: '',
      tags: '',
    };

    this.share = {
      twitter: '',
      facebook: '',
      linkedin: '',
      email: '',
    };

    this.__domRefs = {
      figures: null,
    };

    this.failure = false;
    this.loaded = false;
  }

  firstUpdated() {
    this.shadowRoot
      .querySelector('blog-network-warning')
      .addEventListener('try-reconnect', () => this.mount());
  }

  async mount() {
    this.__showSkeleton(true);
    window.scroll(0, 0);
    this.resetView();
    await this._fetchMetaData();
  }

  resetView() {
    this.loaded = false;
    this.metadata = {
      posts: [],
      article: '',
      title: '',
      dataModified: '',
      date: '',
      readingtime: '',
      permalink: '',
      description: '',
      filename: '',
      view: '',
      tags: '',
    };

    const dom = this.shadowRoot.querySelector('#metadataArticle');
    if (dom && dom.innerHTML !== '') {
      dom.innerHTML = '';
    }
  }

  async _fetchMetaData() {
    let getPath = location.pathname;
    const checkEnding = new RegExp('index.php|index.html', 'g');
    if (checkEnding.test(location.pathname)) {
      getPath = location.pathname.replace(/index\.php|index\.html/g, '');
    }
    const targetUrl = `/data${getPath}index.json`;

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      this.metadata = await response.json();
      this._processMetaData();
      this.failure = false;
    } catch (error) {
      this.failure = true;
      this.loaded = false;
    }
  }

  _processMetaData(data, view) {
    if (this.metadata.article !== undefined && this.metadata.article !== '') {
      const parseHTML = this._unescapeHtml(this.metadata.article);
      this.shadowRoot.querySelector('#metadataArticle').innerHTML = parseHTML;
    }
    this._setPageMetaData(this.metadata);
    this.__showSkeleton(false);
    this.failure = false;
    this.loaded = true;
  }

  __showSkeleton(bool) {
    this.dispatchEvent(
      new CustomEvent('blog-pwa-toggle-skeleton', {
        bubbles: true,
        composed: true,
        detail: {
          show: bool,
        },
      }),
    );
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .hotpink {
        color: var(--hotpink);
      }

      a {
        color: var(--accent-color-primary);
        text-decoration: none;
        border-bottom: 1px solid var(--accent-color-primary);
      }

      a:hover {
        color: var(--accent-color-secondary);
        text-decoration: none;
        border-bottom: 1px solid var(--accent-color-secondary);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-family: var(--font-family-sans-serif);
        margin: 0;
      }

      p,
      li,
      label {
        font-family: var(--font-family-serif);
        margin: 0;
        color: var(--primary-text-color);
        margin-top: 10px;
        margin-bottom: 29px;
        font-weight: 400;
        font-style: normal;
        font-size: 21px;
        line-height: 1.58;
        letter-spacing: -0.003em;
      }

      h1 {
        font-family: var(--font-family-headers);
        font-size: 28px;
        margin-left: -1.75px;
        line-height: 1.25;
        letter-spacing: -0.02em;
        font-weight: 700;
        margin-top: 16px;
      }

      h2 {
        font-family: var(--font-family-headers);
        font-size: 24px;
        margin-left: -1.75px;
        line-height: 1.15;
        letter-spacing: -0.02em;
        font-weight: 700;
        font-style: normal;
      }

      h3 {
        font-size: 20px;
        margin-left: -1.75px;
        line-height: 1.15;
        letter-spacing: -0.02em;
        font-weight: 400;
        font-style: normal;
      }

      li {
        margin-bottom: 20px;
      }

      /* Don't like this; special case. TODO extract */
      p code,
      li code {
        background-color: var(--code-background);
        font-size: 19px;
        color: var(--code-color);
        padding: 5px;
      }

      blockquote {
        border-left: 5px solid var(--accent-color-primary);
        padding-left: 10px;
        margin-left: 10px;
      }

      blockquote,
      blockquote p {
        font-style: oblique;
        font-weight: 400;
        font-size: 20px;
      }

      /*
        Design choice: in my components, I always have a #main as a container
        in my web components. Why isn't named container? No idea. LOL.
      */
      #main {
        margin: auto;
        padding: 0 20px;
        max-width: 800px;
      }

      #tags a {
        display: inline-flex;
        border: 1px solid #ccc;
        border-radius: 2px;
        padding: 0.25em 0.5em;
        margin-top: 0.25em;
        background: #f2f0f0;
        line-height: auto;
      }

      @media (max-width: 767px) {
        #main {
          margin: auto;
          max-width: 800px;
        }

        p,
        li,
        label {
          font-size: 18px;
          line-height: 1.58;
          letter-spacing: -0.004em;
        }
      }

      [hidden] {
        display: none !important;
      }
    `;
  }

  /**
   *
   * @param {object} {{title, description, url, imagetwitter, imagefb}}
   */
  _setPageMetaData({title, description, url, imagetwitter, imagefb}) {
    // Flip the metadata on load
    // Note, Google Search will index this
    document.title = `${title} - Justin Ribeiro`;
    document.head
      .querySelector("meta[name='description']")
      .setAttribute('content', description);

    this._setMeta('property', 'og:title', document.title);
    this._setMeta('property', 'twitter:title', document.title);

    if (description) {
      this._setMeta('property', 'og:description', description);
      this._setMeta('property', 'twitter:description', description);
    }

    const fallbackImg = `${document.location}images/manifest/me-2018-192.png`;
    imagetwitter = imagetwitter || fallbackImg;
    imagefb = imagefb || fallbackImg;
    if (imagetwitter) {
      this._setMeta('property', 'twitter:image:src', imagetwitter);
      this._setMeta('property', 'og:image', imagefb);
    }

    url = url || document.location.href;
    this._setMeta('property', 'og:url', url);
    this._setMeta('property', 'twitter:url', url);

    if (window.ga) {
      ga('send', {
        hitType: 'pageview',
        page: window.location.pathname,
        location: url,
        title: title,
      });
    }
  }

  /**
   * Locate and find document meta tags to update
   * @param {string} attrName
   * @param {string} attrValue
   * @param {string} content
   */
  _setMeta(attrName, attrValue, content) {
    let element = document.head.querySelector(
      `meta[${attrName}="${attrValue}"]`,
    );
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content || '');
  }

  /**
   * Fixes stuff I spit into JSON from Hugo
   * @param {String} raw Anything HTML that needs unescaping..
   * @return {String} string
   */
  _unescapeHtml(raw) {
    const process = document.createElement('textarea');
    process.innerHTML = raw;
    return process.textContent;
  }

  /**
   * Check the current state of the view so we can get rid of the skelton in
   * weird inbetween states
   * @param {boolean} failed
   * @param {boolean} loaded
   * @return {boolean} state
   */
  __checkViewState(failed, loaded) {
    // In the event a network fail happens and we get not SW load,
    // hide the skeleton
    // In the event the network doesn't fail and we get a load,
    // hide the skeleton
    if ((failed && !loaded) || (!failed && loaded)) {
      return true;
    } else {
      return false;
    }
  }
}
