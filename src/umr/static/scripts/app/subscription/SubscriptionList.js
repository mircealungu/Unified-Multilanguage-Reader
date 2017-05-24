import $ from 'jquery'
import Mustache from 'mustache';
import config from '../config';
import ZeeguuRequests from '../zeeguuRequests';
import NoFeedTour from './NoFeedTour';

/**
 * Shows a list of all subscribed feeds, allows the user to remove them.
 * It updates the {@link ArticleList} accordingly.
 */
export default class SubscriptionList {
    /**
     * Bind with the {@link ArticleList}, initialise an empty list of feeds and a {@link NoFeedTour} object.
     * @param {ArticleList} articleList - List of all articles available to the user.
     */
    constructor(articleList) {
        this.articleList = articleList;
        this.noFeedTour = new NoFeedTour();
        this.feedList = new Set();
    }

    /**
     *  Call zeeguu and retrieve all currently subscribed feeds.
     *  Uses {@link ZeeguuRequests}.
     */
    load() {
        ZeeguuRequests.get(config.GET_FEEDS_BEING_FOLLOWED, {}, this._loadSubscriptions.bind(this));
    };

    /**
     * Remove all feeds from the list, clear {@link ArticleList} as well.
     */
    clear() {
        $(config.HTML_ID_SUBSCRIPTION_LIST).empty();
        this.articleList.clear();
    };

    /**
     * Call clear and load successively.
     */
    refresh() {
        // Refresh the feed list.
        this.clear();
        this.load();
    };

    /**
     * Fills the subscription list with all the subscribed feeds.
     * Callback function for the zeeguu request,
     * makes a call to {@link ArticleList} in order to load the feed's associated articles.
     * @param {Object[]} data - List containing the feeds the user is subscribed to.
     */
    _loadSubscriptions(data) {
        var template = $(config.HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        for (var i = 0; i < data.length; i++) {
            this._addSubscription(data[i]);
            this.articleList.load(data[i]);
        }

        if (this.feedList.size < 1)
            this.noFeedTour.show();
        else
            this.noFeedTour.hide();
    }

    /**
     * Add the feed to the list of subscribed feeds.
     * @param {Object[]} feed - Data of the particular feed to add to the list.
     */
    _addSubscription(feed) {
        if (this.feedList.has(Number(feed.id)))
            return;

        let template = $(config.HTML_ID_SUBSCRIPTION_TEMPLATE).html();
        let subscription = $(Mustache.render(template, feed));
        let removeButton = $(subscription.find(".removeButton"));
        let _unfollow = this._unfollow.bind(this);
        removeButton.click(function(feed) {
            return function () {
                _unfollow(feed);
            };
        }(feed));
        $(config.HTML_ID_SUBSCRIPTION_LIST).append(subscription);
        this.feedList.add(Number(feed.id));

        this.noFeedTour.hide();
    }

    /**
     * Subscribe to a new feed, calls the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object[]} feed - Data of the particular feed to subscribe to.
     */
    follow(feed) {
        this._addSubscription(feed);
        let callback = ((data) => this._onFeedFollowed(feed, data)).bind(this);
        ZeeguuRequests.post(config.FOLLOW_FEED_ENDPOINT, {feed_id: feed.id}, callback);
    }

    /**
     * A feed has just been followed, so we call the {@link ArticleList} to update its list of articles.
     * If there was a failure to follow the feed, we remove this feed from our list.
     * Callback function for Zeeguu.
     * @param {Object[]} feed - Data of the particular feed that has been subscribed to.
     * @param {string} data - Reply from the server.
     */
    _onFeedFollowed(feed, data) {
        if (data === "OK") {
            this.articleList.load(feed);
        } else {
            this._remove(feed);
        }
    }

    /**
     * Un-subscribe from a feed, call the zeeguu server.
     * Uses {@link ZeeguuRequests}.
     * @param {Object[]} feed - Data of the particular feed to unfollow.
     */
    _unfollow(feed) {
        this._remove(feed);
        var callback = ((data) => this._onFeedUnfollowed(feed, data)).bind(this);
        ZeeguuRequests.get(config.UNFOLLOW_FEED_ENDPOINT + "/" + feed.id, {}, callback);
    }

    /**
     * A feed has just been removed, so we remove the mentioned feed from the subscription list.
     * Callback function for zeeguu.
     * @param {Object[]} feed - Data of the particular feed to that has been unfollowed.
     * @param {string} data - Server reply.
     */
    _onFeedUnfollowed(feed, data) {
        if (data !== "OK") {
            this._onFeedFollowed(feed, "OK");
        }
    }

    /**
     * Remove a mentioned feed from the local list (not from the zeeguu list).
     * Makes sure the associated articles are removed as well by notifying {@link ArticleList}.
     * @param {Object[]} feed - Data of the particular feed to remove from the list.
     */
    _remove(feed) {
        this.articleList.remove(feed.id);
        if (!this.feedList.delete(Number(feed.id)))  { console.log("Error"); }
        $('span[removableID="' + feed.id + '"]').fadeOut();

        if (this.feedList.size < 1)
            this.noFeedTour.show();
    }
};