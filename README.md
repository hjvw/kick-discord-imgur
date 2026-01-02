# If you don`t subscribe to a streamer you cant send links with more than x special characters e.g discord media on kick
## This extension solves it by changing it into an imgur link. 

To run clone repo, change imgur client id in inject.ts file run `npx tsc` in project folder, then go to extensions and import manifest from dist folder.

You can find imgur client id by making imgur account -> new post -> open web console -> paste image url -> search for post request -> go to headers -> you get client_id=`your client id` 
