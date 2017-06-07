import $ from 'jquery';
import ArticleList from './ArticleList';
import SubscriptionList from './SubscriptionList';
import FeedSubscriber from './FeedSubscriber';
import LanguageMenu from './LanguageMenu';
import config from '../config';

/* Script that binds listeners to html events, such that the
 * correct object is called to handle it. */
let subscriptionList = new SubscriptionList();
let articleList = new ArticleList(subscriptionList);
let languageMenu = new LanguageMenu();
let feedSubscriber = new FeedSubscriber(subscriptionList, languageMenu);

document.addEventListener(config.EVENT_SUBSCRIPTION, function(e) {
    articleList.clear();
    articleList.load(e.detail);
});

/* When the document has finished loading,
 * bind all necessary listeners. */
$(document).ready(function() {
    subscriptionList.load();
    feedSubscriber.load();

    let showAddFeedDialogButton = document.querySelector('.show-modal');
    $(showAddFeedDialogButton).click(function () {
        feedSubscriber.open();
    });
});

/* Called when no image could be loaded as an article avatar. */
function noAvatar(image) {
    image.src = noAvatarURL;
}