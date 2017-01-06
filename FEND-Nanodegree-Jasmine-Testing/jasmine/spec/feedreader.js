/**
* feedreader.js
**/

$(function() {
    "use strict";
    // First test suite. RSS feeds definitions 
    describe('RSS Feeds', function() {
        /* Test that checks if the allFeeds variable
        *  has been defined and not empty
        */
        it('are defined', function() {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });

        /* Loop through each feed in the allFeeds
        *  and checks if it has an URL defined and not empty
        */
         it('have url', function() {
            allFeeds.forEach(function(feed){
                expect(feed.url).toBeDefined();
                expect(feed.url).not.toBe(0);
            });
         });

        /* Loop through each feed in the allFeeds
        *  and checks if it has an name defined and not empty
        */
         it('have name', function() {
            allFeeds.forEach(function(feed){
                expect(feed.name).toBeDefined();
                expect(feed.name).not.toBe(0);
            });
         });
    });

    // Second test suite. Sidebar Menu 
     describe('The menu', function() {
        var body = document.body;
        var menuIcon = document.querySelector('.menu-icon-link');

        /* Check if the body has the class .menu-hidden,
        *  meaning that the menu is hidden.
        */
        it('is hidden by default', function(){
            expect(body.className).toBe('menu-hidden');
        });;

        /* Check if the body doesn't have the class .menu-hidden
        *  after a click on the menu icon. Then check if the class
        *  .menu-hidden reappears after a second click on the menu icon.
        */ 
        it('toggle visibility when the menu icon is clicked', function(){
            menuIcon.click();
            expect(body.className).not.toBe('menu-hidden');

            menuIcon.click();
            expect(body.className).toBe('menu-hidden');
        });
     });

     // Third test suite. Initial Entries.
    describe('Initial Entries', function() {
        // Call a function to do an async request
        beforeEach(function(done){
            loadFeed(0, function() {
                done();
            });
        });

        /* Check if the loadFeed function has at least
        *  one .entry element within the .feed container.
        *  
        */ 
        it('has at least an entry after loading', function(done) {
            var feed = document.querySelector('.feed'),
                feedEntries = feed.getElementsByClassName('entry');

            expect(feedEntries.length).toBeGreaterThan(0);
            done();
        });

    });

    // Fourth test suite. News Feeds Loaded.
     describe('New Feed Selection', function() {
        var feedBefore,
            feedAfter;

        /* Call the feed and store the content of the .feed
        *  container in a variable.
        */ 
        beforeEach(function(done){
            loadFeed(0, function() {

                feedBefore = document.querySelector('.feed').innerHTML;

                loadFeed(1, function() {
                    done();
                });

            });
        });

        /* Compares the first and the second feed content and
        *  check if the content is different.
        */ 
        it('displays a new content when a new feed is loaded', function(){
            feedAfter = document.querySelector('.feed').innerHTML;
            expect(feedAfter).not.toEqual(feedBefore);
        });

     });

}());
