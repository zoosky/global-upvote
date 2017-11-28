import browser from 'detect-browser';
import 'whatwg-fetch';
import React, { Component } from "react";
import ReactGA from 'react-ga';
import Masonry from 'react-masonry-component';
import styled, { injectGlobal } from "styled-components";
import Ad from "./Ad";
import Offline from "./Offline";
import Story from "./Story";
import Background from "./handmadepaper.png";

const black = "#2a2626";

const storageAvailable = type => {
  try {
    var storage = window[type], x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      storage.length !== 0
    );
  }
};

injectGlobal`
  body {
    background: #eef1f1;
    background-image: url(${Background});
    color: ${black};
    font-family: 'Times New Roman', serif;
    font-weight: 300;
    margin: 0 6.25vw;

    @media (min-width: 640px) {
      margin: 0 3.125vw;
    }

    @media (min-width: 1650px) {
      margin: 0 calc((100vw - 1650px) / 2 + 50px);
    }
  }

  @media (min-width: 640px) {
    .gutter-sizer {
      width: 6.66%;
    }

    .grid-sizer {
      width: 46.66%;
    }
  }
  
  @media (min-width: 1056px) {
    .gutter-sizer {
      width: 3.22%;
    }

    .grid-sizer {
      width: 22.58%;
    }
  }

  section {
    margin-bottom: 5.8vw;
    width: 100%;
  
    @media (min-width: 640px) {
      margin-bottom: 5vw;
      width: 46.66%;
    }
    
    @media (min-width: 1056px) {
      margin-bottom: 2.25vw;
      width: 22.58%;

      &.double {
        width: 48.387%;
      }
    }
    
    @media (min-width: 1650px) {
      margin-bottom: 38px;
    }
  }
`;

const Bar = styled.div`
  border-bottom: 1px solid ${black};
  border-top: 1px solid ${black};
  margin-bottom: 2.172rem;
`;

const Medium = styled.p`
  display: none;

  @media (min-width: 640px) {
    display: initial;
  }
`;

const Subheader = styled.div`
  display: flex;
  font-size: .875rem;
  justify-content: space-between;

  a, p {
    color: ${black};
    text-decoration: none;
  }
`;

const Tagline = styled.p`
  @media (min-width: 640px) {
    margin: auto 3.125vw;
  }
`;

const Title = styled.h1`
  font-size: 2.618rem;
  font-weight: 900;
  margin: 0.809rem 0;
  text-align: center;
  
  @media (min-width: 320px) {
    font-size: calc( 41.888px + (109.664 - 41.888) * (100vw - 320px) / (640 - 320) );
  }
  
  @media (min-width: 640px) {
    font-size: 6.854rem;
  }
`;

class App extends Component {
  state = {
    browser: null,
    fetching: true,
    offline: false,
    stories: [],
    usingExtension: null,
  };

  componentDidMount() {
    this.setState({
      browser: browser.name,
      usingExtension: window.self !== window.top,
      version: parseFloat(browser.version),
    });
    this.getStories();
    window.addEventListener("offline", this.toggleConnection);
    window.addEventListener("online", this.toggleConnection);

    if (window.location.hostname !== 'localhost') {
      ReactGA.initialize('UA-43808769-9');
      ReactGA.pageview('pageview');
    }
  }

  getStories = () => {
    if (
      storageAvailable("localStorage") &&
      !navigator.onLine &&
      localStorage.getItem("stories") !== null
    ) {
      // Offline, but should have old stories to share
      this.setState({
        fetching: false,
        offline: true,
        stories: JSON.parse(localStorage.getItem("stories"))
      });
    } else {
      fetch("/worldnews").then(response => response.json()).then(response => {
        const stories = response.stories
          .filter(
            (thing, index, self) =>
              self.findIndex(t => t.id === thing.id) === index
          )
          .sort((a, b) => a.position - b.position);

        this.setState({
          fetching: false,
          offline: false,
          stories
        });

        if (storageAvailable("localStorage")) {
          localStorage.setItem("stories", JSON.stringify(stories));
        }
      });
    }
  };

  toggleConnection = connected => {
    if (navigator.onLine) {
      this.getStories();
    } else {
      this.setState({ offline: true });
    }
  };

  render() {
    return (
      <div>
        <Title>The Global Upvote</Title>
        <Bar>
          <Subheader>
            <Medium>
              <a href="http://www.seejamescode.com">James Y Rauhut</a>
            </Medium>
            <Tagline>
              Top voted stories across the web, summarized and updated every sixty seconds.
            </Tagline>
            <Medium>
              <a href="https://www.reddit.com/r/worldnews/">WorldNews</a>
              ,
              {" "}
              <a href="https://www.reddit.com">Reddit</a>
            </Medium>
          </Subheader>
          <Offline black={black} offline={this.state.offline} />
        </Bar>
        <Masonry
          options={{
            columnWidth: '.grid-sizer',
            gutter: '.gutter-sizer',
            percentPosition: true,
            transitionDuration: 0,
          }}
          updateOnEachImageLoad={true}
        >
          <div className="grid-sizer" />
          <div className="gutter-sizer" />
          <Story
            fetching={this.state.fetching}
            thumbnail
            {...this.state.stories[0]}
          />
          <Story
            double
            fetching={this.state.fetching}
            {...this.state.stories[1]}
          />
          <Ad
            black={black}
            url="http://www.unidosporpuertorico.com/en/"
            svg={`<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><circle fill=${black} strokeWidth="69" cx="123.5" cy="150.5" r="100" /> <path d="M25,151 C25.6666667,137.666667 32.6666667,118.333333 46,93 C93.3333333,33.6666667 159.666667,4 245,4 C219.666667,23.3333333 204,43 198,63 C192,83 196,98 210,108 C162.703996,106.819853 130.037329,109.48652 112,116 C93.9626706,122.51348 64.9626706,134.180147 25,151 Z" fill=${black} /> <path d="M1,298 C1.66666667,284.666667 8.66666667,265.333333 22,240 C69.3333333,180.666667 135.666667,151 221,151 C195.666667,170.333333 180,190 174,210 C168,230 172,245 186,255 C138.703996,253.819853 106.037329,256.48652 88,263 C69.9626706,269.51348 40.9626706,281.180147 1,298 Z" fill=${black} transform="translate(111.000000, 224.500000) scale(-1, -1) translate(-111.000000, -224.500000) " /></g>`}
            text="Donate to <br /> Puerto Rico <br /> Relief!"
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[2]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[3]}
            />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[4]}
          />
          {
            this.state.browser === "chrome" && !this.state.usingExtension
              ? (
                <Ad
                  black={black}
                  url="https://chrome.google.com/webstore/detail/global-upvote-tab/nbbannbnjlkkhobfdpijealmagpfbioh"
                  svg={`<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g fill-rule="nonzero" fill=${black}> <path d="M73.6600681,153.184255 C73.6600681,140.879977 77.2962002,130.037429 84.5562042,121.266101 L63.4509822,50 C29.0277366,71.3126824 6,109.37635 6,152.941974 C6,195.875395 28.3383286,233.51933 61.955693,255 L106,200.232194 C87.0950365,192.939157 73.6600681,174.716977 73.6600681,153.184255 Z"></path> <path d="M245.296436,132 L170.682322,133.406048 C172.840453,138.996025 174.162615,145.023282 174.162615,151.372994 C174.162615,179.02714 151.580599,201.418918 123.729762,201.418918 C122.878216,201.418918 123.100071,201.305028 122.264574,201.275032 L121.952561,201.739028 L75,259.519152 C90.5770592,266.814196 107.931319,271 126.299032,271 C192.970734,271 247,217.315224 247,151.132091 C246.999056,144.587876 246.309417,138.238165 245.296436,132 Z"></path> <path d="M123.994321,101.42884 C140.303425,101.42884 152.782353,106.965449 161.971005,119 L163.792812,118.833652 L242,117.301648 C227.272905,67.4523699 181.201972,31 126.558136,31 C108.886093,31 92.1374375,34.904231 77,41.750419 L97.0756784,109.365008 C104.870769,104.396244 114.073554,101.42884 123.994321,101.42884 Z"></path> <path d="M91,151.499046 C91,169.448202 105.551271,184 123.499523,184 C141.446822,184 156,169.447726 156,151.499046 C156,133.552751 141.446822,119 123.499523,119 C105.550794,119 90.9995231,133.552751 91,151.499046 Z"></path> </g> </g>`}
                  text="Download the Global Upvote Tab for Chrome!"
                />
              ) : null
          }
          {
            !this.state.usingExtension &&
            this.state.browser === "firefox" &&
            this.state.version > 54
              ? (
                <Ad
                  black={black}
                  url="https://addons.mozilla.org/en-US/firefox/addon/global-upvote-tab/"
                  svg={`<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g fill-rule="nonzero"> <g transform="translate(8.000000, 36.000000)"> <path d="M197,28 C196.340881,27.3248212 195.674379,26.6583248 195,26 C195.663549,26.6649642 196.331036,27.3314607 197,28 Z" fill=${black}></path> <path d="M5,91 C5,91 4.68204892,91.5558242 4.20350715,92.4821978 C4.13520997,92.9879121 4.06460545,93.492967 4,94 C4.30087679,92.8026374 4.6326719,91.7879121 5,91 Z" fill=${black}></path> <path d="M38.501545,38 C38.7165479,37.7781776 38.9267083,37.5524204 39.1436482,37.3320735 C49.1514521,27.1670981 60.8037375,19.1869014 73.7775161,13.6137976 C87.2064809,7.84444732 101.475119,4.918949 116.185869,4.918949 C130.072442,4.918949 143.563389,7.52868237 156.327492,12.6733886 C163.782862,13.9816982 173.720451,16.5009319 182,21.2816723 C163.420166,7.87986021 140.709274,0 116.185869,0 C84.3915894,0 55.6475419,13.2493399 35,34.6023298 C35.9607337,35.7881698 37.1175849,36.9317111 38.501545,38 Z" fill=${black}></path> <path d="M78.8997265,122.936568 C78.107825,122.273879 77.4306427,121.565974 76.8536582,120.827438 C76.6595552,122.459121 76.5312826,124.214784 76.5317666,126.058449 C76.5312826,129.492955 76.9586964,133.200706 78.1271869,136.875881 C79.2971294,140.553 81.1974995,144.19949 84.1927849,147.58489 C86.1914166,149.841824 88.6813564,151.98596 91.7957174,153.934643 L91.6214603,154.216152 C97.4711732,154.32263 106.990933,154.209832 111.81495,152.59468 C119.075661,150.163687 130.692799,140.925915 130.692799,140.925915 C133.597083,138.008723 136.985415,139.467319 139.889699,139.467319 C142.793984,139.467319 143.762078,135.091532 139.889699,130.715745 C136.01732,126.339958 122.463993,121.964171 112.298997,128.77095 C102.134002,135.57773 87.6125798,130.229546 78.8997265,122.936568 Z M85.9159936,58.7709982 C85.2683382,61.1942119 84.7068432,64.2694178 84.7082954,67.6134916 C84.7087794,70.9891682 85.2717265,74.6196129 86.8521413,78.1912275 C88.1203455,81.0559095 89.3173947,83.1572597 90.4060173,84.8443687 C91.1712963,86.0297208 91.8842981,87.0098971 92.5517995,87.9224918 C93.9143929,86.6627513 95.5073929,85.3991213 96.8099644,84.526881 C99.7142489,82.5820868 110.847339,77.2339026 112.299481,75.7753069 C113.751624,74.3167112 116.655908,66.5375341 114.235671,64.1065413 C111.815434,61.6755485 96.325917,63.1341442 91.485443,62.161747 C89.4456673,61.7518816 87.4939881,60.3064133 85.9159936,58.7709982 Z M89.0419717,106.344555 C89.0569772,106.382965 89.064722,106.40533 89.064722,106.40533 C89.0835998,106.367893 89.0990893,106.328025 89.1174831,106.290101 L89.0419717,106.344555 Z M232.342753,84.5263948 C232.342753,88.478703 228.789361,94.0169908 228.10153,95.0511352 C228.244808,94.6840553 228.470374,93.5259303 228.470374,89.8745791 C228.470374,84.5263948 229.922516,70.912835 223.145852,55.8406795 C216.369189,40.768524 206.204193,33.4755455 206.204193,33.4755455 L206.204193,36.8789354 C204.752051,32.0169498 191.198724,22.779177 191.198724,22.779177 L191.198724,27.6411627 C215.401094,50.0062967 217.821331,65.5646508 217.821331,65.5646508 C213.464904,51.4648924 200.879672,40.768524 190.230629,30.5583541 C179.581586,20.3481842 157.315406,15 157.315406,15 C181.033728,28.6135598 192.650866,50.0062967 192.650866,50.0062967 C180.549681,38.3375311 170.868733,39.3099283 170.868733,39.3099283 C178.129444,44.6581125 181.517776,50.4924953 188.294439,61.1888637 C195.071103,71.8852321 194.587056,97.1675575 194.587056,97.1675575 C191.198724,88.9021819 184.42206,85.498792 184.42206,85.498792 C184.42206,85.498792 185.874202,100.084749 186.842297,108.350125 C187.810392,116.6155 183.453965,132.173854 183.453965,132.173854 C183.453965,126.339471 180.065634,124.880876 180.065634,124.880876 C180.065634,124.880876 181.033728,128.284266 176.193254,143.84262 C171.35278,159.400974 162.15588,164.749158 160.703737,164.26296 C159.251595,163.776761 160.703737,161.345768 160.703737,161.345768 C160.703737,161.345768 158.2835,159.400974 154.895169,164.749158 C152.037353,169.259622 147.113623,171.695477 145.642119,172.347469 C147.220597,171.447516 147.634458,168.152548 147.634458,168.152548 C147.634458,168.152548 144.246126,170.097342 128.756609,172.528335 C113.267092,174.959328 106.006381,168.152548 106.006381,168.152548 C107.458523,166.693952 114.235187,168.152548 114.235187,168.152548 C114.235187,166.693952 106.490428,164.26296 98.74567,163.290562 C92.4491814,162.500004 89.3962944,159.566768 87.9354394,157.214539 C85.031639,155.254186 82.5959125,153.09741 80.5754986,150.815193 C78.2598159,148.199931 76.4915907,145.42082 75.1730456,142.600869 C72.5340191,136.955617 71.6917767,131.169854 71.6912926,126.057962 C71.6922607,121.230983 72.4396299,116.98647 73.186515,113.924391 C73.9343683,110.863285 74.6846418,108.983641 74.7185251,108.899529 L74.7185251,108.899529 L74.8216272,108.941342 C75.7306682,106.1316 77.515351,103.872722 79.6277338,102.951862 C78.9650729,102.497752 78.2854704,102.075246 77.5831176,101.702818 C74.4222881,100.005012 70.8393692,99.3000245 67.3179243,99.8868661 C63.7887347,100.448425 60.4100839,102.205061 57.4070538,104.510614 C54.5255196,106.718928 52.232103,109.863174 50.7276837,113.33366 C49.2126153,116.815814 48.453629,120.658727 48.454113,124.521089 C48.4507247,128.386367 49.2077748,132.269635 50.6032835,135.926821 C51.9949198,139.588869 54.0153336,143.024348 56.4573528,146.13456 C58.899856,149.249634 61.759608,152.045276 64.8618678,154.538988 C61.626495,152.221766 58.5982944,149.57879 55.9481349,146.560956 C53.2994275,143.547983 51.0326335,140.152859 49.3786436,136.436843 C47.7222334,132.727148 46.6912124,128.696076 46.4661304,124.577488 C46.238144,120.463276 46.8136764,116.267382 48.2682388,112.33987 C49.7257056,108.419651 52.0423564,104.750797 55.3396873,101.909452 C56.9326873,100.569489 58.6665451,99.3520477 60.5490055,98.3446443 C62.4290456,97.3367546 64.4726937,96.5505716 66.6238004,96.1081309 C68.7720027,95.6647178 71.0228232,95.5806054 73.2174941,95.8878829 C75.4145852,96.1883536 77.5429417,96.8666006 79.5134986,97.8064225 C81.4874439,98.7467305 83.3098824,99.9408342 84.9793619,101.298787 C85.8138596,101.978979 86.6115697,102.700011 87.3724923,103.463829 C87.7534376,103.845495 88.1242179,104.237857 88.4872534,104.644319 C88.789299,104.98563 89.0685943,105.308953 89.3706399,105.693536 C91.0953008,101.202519 89.8861504,93.6956136 89.6029827,92.119844 C88.6900693,90.8216939 87.3947584,89.1841771 85.9353555,86.8465344 C84.8351158,85.082606 83.6453273,82.9185362 82.427464,80.1651937 C80.5222534,75.8603916 79.8658851,71.5269038 79.8663692,67.6125192 C79.8678213,63.0417664 80.7521759,59.0243077 81.6321741,56.1255919 C81.9042088,55.2319589 82.1757593,54.4448034 82.4231076,53.78017 C85.1584594,41.828923 98.2601705,30.0721555 98.2601705,30.0721555 C79.8663692,27.6411627 67.2811367,44.6581125 67.2811367,44.6581125 C67.2303118,44.6265096 67.1780346,44.5983101 67.1267256,44.5671934 C65.8222179,46.0194685 61.4004448,51.2140139 60.9885205,55.3544809 C60.9885205,55.3544809 61.1414795,47.9136981 62.9939289,42.7113734 C55.9757256,40.4651361 47.7154567,41.6388194 43.4790738,42.5207836 L43.5066645,42.6753947 C39.1657274,43.4576882 35.2008952,45.1355595 31.6784822,47.247606 C28.1575214,49.358194 25.0862407,51.9010125 22.5624175,54.3640944 C17.5205798,59.2795619 14.674381,63.870735 14.6448541,63.9217858 L14.6448541,63.9217858 L14.6453382,63.9237306 L14.5088368,63.8391321 C5.59994439,76.8079926 0,104.461508 0,104.461508 C0.968094804,100.085721 5.32452142,94.7375371 5.32452142,94.7375371 C0.484047402,102.030516 1.45214221,135.578217 1.45214221,135.578217 C1.45214221,130.230032 4.35642662,123.909451 4.35642662,123.909451 C5.32452142,135.092018 10.1649954,171.070712 41.6280766,198.297832 C73.0911577,225.524951 99.7137648,227.955944 99.7137648,227.955944 C93.4211486,226.01115 91.9690064,223.093958 91.9690064,223.093958 C112.298997,231.359334 124.88423,229.900738 124.88423,229.900738 C121.495898,227.955944 121.011851,226.497348 121.011851,226.497348 C142.793984,227.469745 171.836828,219.690568 178.613491,214.828583 C185.390155,209.966597 191.198724,200.242626 191.198724,200.242626 C208.62443,191.97725 220.725615,174.9603 224.113947,166.208726 C227.502279,157.457152 224.113947,148.219379 224.113947,148.219379 C224.113947,148.219379 224.113947,147.733181 232.342753,129.257635 C240.571559,110.78209 232.342753,84.5263948 232.342753,84.5263948 Z M29.1062543,43.1285318 C31.1479663,41.8979632 33.3518341,40.7869995 35.7023683,39.870029 C26.3830036,32.073835 27.1066545,21.8072661 27.1066545,21.8072661 C17.7819654,30.8505594 15.5064585,46.1133048 15.0291878,55.3432984 C15.1608487,55.188201 15.2920255,55.0331037 15.429495,54.8746029 C18.5840319,51.2300585 23.1882908,46.6982017 29.1062543,43.1285318 Z" fill=${black}></path> </g> </g> </g>`}
                  text="Download the Global Upvote Tab for Firefox!"
                />
              ) : null
          }
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[5]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[6]}
          />
          <Story
            fetching={this.state.fetching}
            thumbnail
            {...this.state.stories[7]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[8]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[9]}
          />
          <Story
            fetching={this.state.fetching}
            {...this.state.stories[10]}
          />
          {
            this.state.stories
            .slice(11)
            .map((story) => (
                <Story
                  fetching={this.state.fetching}
                  key={story.id}
                  {...story}
                />
              ))
          }
        </Masonry>
      </div>
    );
  }
}

export default App;
