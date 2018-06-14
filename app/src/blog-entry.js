import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';
import {BlogUtils} from './blog-utils-mixin.js';
import './blog-network-warning.js';
import './code-block.js';
import './shared-styles.js';

class BlogEntry extends BlogUtils(PolymerElement) {
  static get properties() {
    return {
      metadata: {
        type: Object,
        notify: true,
      },
      loaded: Boolean,
      route: Object,
      entryRoute: Object,
    };
  }

  static get observers() {
    return [
      '_routeChanged(entryRoute.title)',
      '_metaDataChanged(metadata.article)',
    ];
  }

  ready() {
    super.ready();
    this.shadowRoot.querySelector('blog-network-warning')
      .addEventListener('try-reconnect', () => this._routeChanged());
  }

  resetView() {
    this.set('loaded', null);
    this.set('metadata', {});
    this.$.metadataArticle.innerHTML = '';
  }

  _routeChanged() {
    // Meh.
    window.scroll(0, 0);

    if (this.route) {
      // Technically, I would just build the string which at this point
      // with the chopping off extra things from the path might be more
      // useful in the long haul
      let getPath = this.route.path;
      let checkEnding = new RegExp('index\.php|index\.html', 'g');
      if(checkEnding.test(this.route.path)) {
         getPath = this.route.path.replace(/index\.php|index\.html/g, '');
      }

      let targetUrl = '/data/chronicle' + getPath + 'index.json';

      this._getResource({
        url: targetUrl,
        onLoad: (e) => {
          this.set('metadata', JSON.parse(e.target.responseText));
        },
        onError: (e) => {
          this.set('loaded', false);
          this.set('failure', true);
        },
      }, 3);
    }
  }

  _generatedShareLinks() {
      this.set('twitterShare', 'https://twitter.com/intent/tweet?url=' +
      this.metadata.prmalink + '&text=' + this.metadata.title +
      ' via @justinribeiro');

      this.set('facebookShare', 'https://www.facebook.com/sharer.php?u=' +
        this.metadata.permalink);

      this.set('gplusShare', 'https://plus.google.com/share?url=' +
        this.metadata.permalink);

      this.set('linkedinShare',
        'https://www.linkedin.com/shareArticle?mini=true&url=' +
        this.metadata.permalink + '&title=' + this.metadata.title +
        '&source=&summary=' + this.metadata.description);

      this.set('emailShare', 'mailto:?subject=Article: ' + this.metadata.title +
        '&body=Article from Justin Ribeiro: "' + this.metadata.permalink + '"');
  }

  _metaDataChanged() {
    if (this.metadata.article !== undefined && this.metadata.article !== '') {
      this._setPageMetaData(this.metadata);

      this.$.metadataArticle.innerHTML = this._unescapeHtml(this.metadata.article);
      this._generatedShareLinks();

      this.set('failure', false);
      this.set('loaded', true);
    }
  }

  static get template() {
    return html`
      <style include="shared-styles">
        #main iframe, #main img {
          max-width: 100%;
        }

        #main img {
          margin: auto;
          display: block;
          background-color: var(--img-background);
        }

        time {
          text-transform: uppercase;
        }

        .dotDivider {
          padding-right: .45em;
          padding-left: .45em;
        }
        .dotDivider:after {
          content: '·';
        }

        .reads {
          margin-top: 10px;
        }

        footer {
          display: block;
          background-color: var(--section-color);
          padding: 1em;
        }

        #share > a {
          margin-right: 0.5em;
        }

        .hidden {
          display: none !important;
        }
      </style>

      <!-- :chopchop is there because there is a chance that you end up with
      cruft, ala index.* something. In my analytics, even with redirection, I
      still see index.php for instance from when I was running Wordpress years
      ago. This resolves this potential issue. -->
      <app-route route="[[route]]" pattern="/:year/:month/:day/:title/:chopchop"
        data="{{entryRoute}}"></app-route>

      <article itemprop="blogPost" id="main" hidden\$="[[!loaded]]" itemscope=""
        itemtype="http://schema.org/BlogPosting">
      <header>
        <h1 itemprop="headline">[[metadata.title]]</h1>
        <div class="reads">
          <time datetime\$="[[metadata.dataModified]]" itemprop="datePublished">
            [[metadata.date]]
          </time>
          <span class="dotDivider"></span> [[metadata.readingtime]] min read
        </div>
      </header>
      <div id="metadataArticle" itemprop="articleBody"></div>
      <footer>
        <div>
          <h3>Share this piece</h3>
          <p id="share"><a href\$="[[twitterShare]]">Twitter</a> <a href\$="[[facebookShare]]">Facebook</a> <a href\$="[[gplusShare]]">G+</a> <a href\$="[[linkedinShare]]">LinkedIn</a> <a href\$="[[emailShare]]">Email</a></p>
          <p>Author Justin Ribeiro wrote [[metadata.words]] words for this piece and hopes you enjoyed it. Find an issue? <a href="https://github.com/justinribeiro/blog-pwa/issues">File a ticket</a> or <a href\$="https://github.com/justinribeiro/blog-pwa/tree/master/hugo/content/[[metadata.filename]]">edit this on Github.</a></p>
        </div>
      </footer>
      </article>

      <section id="skeleton" hidden\$="{{_checkViewState(failure, loaded)}}">
      <p></p><hr><hr><hr><hr class="short"><p></p>
      <p></p><hr><hr><hr><hr class="short"><p></p>
      <p></p><hr><hr><hr><hr class="short"><p></p>
      </section>

      <blog-network-warning hidden$="[[!failure]]">
      </blog-network-warning>
    `;
  }

}
customElements.define('blog-entry', BlogEntry);
