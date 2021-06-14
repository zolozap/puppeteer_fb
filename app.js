require('dotenv').config()
const puppeteer = require('puppeteer');  
const scrollPage = require('puppeteer-autoscroll-down');
const mongoose = require('mongoose')
const celery = require('celery-node');
const TargetList = require('./models/targetlist')
const rawFacebook = require('./models/rawfacebook')
const selectors = require('./selectors');
const moment = require('moment');


mongoose.connect(process.env.MONGOCLIENT_CONNECT, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB connected!');
});

// Celery
const client = celery.createClient(
  "redis://:POC_2020AION@10.130.143.185:6379/1",
  "redis://:POC_2020AION@10.130.143.185:6379/2",
  "preprocess_test"
);
const task = client.createTask("tasks.preprocess_facebook");

// Start scrape module
(async () => {
  try {
    // Get targets from database
    await TargetList.countDocuments({source: 'facebook'}, function( err, count){
      console.log(`Target count ${count}`)
    })
    const tglists = await TargetList.find()
    let targetss = []
    tglists.forEach(item => targetss.push(item.uid)) //Change to UID
    console.log(`Target: ${targetss}`);

    // Define puppeteer config
    const browser = await puppeteer.launch({
      headless: true, //default is false
      args: ['--lang=en-UK,en','--no-sandbox'],
      slowMo: 30
    });
    const page = await browser.newPage();
    const scrollStep = 500 // default
    const scrollDelay = 100 // default
    await page.setDefaultNavigationTimeout(1000000);
    await page.setViewport({ width: 1000, height: 600 });

    // Login
    await page.goto('https://www.facebook.com');
    await page.waitForSelector(selectors.email_input);
    await page.type(selectors.email_input, process.env.FB_EMAIL);
    await page.type(selectors.password_input, process.env.FB_PASSWORD);
    await page.click(selectors.login_submit);
    await page.waitFor(5000)
    console.log('Sign in to facebook.');

    // Loop scrape post in target list
    var targets = ['superLungtoo','MoveForwardPartyThailand']
    
    for(var target of targets){
        console.log(`Start scrape ${target}`);
        await page.goto(`https://m.facebook.com/${target}/posts/`);
        await page.waitFor(3000)
        
        // Add scroll more if wants more post
        await scrollPage(page, scrollStep, scrollDelay);
        await scrollPage(page, scrollStep, scrollDelay);
        await scrollPage(page, scrollStep, scrollDelay);
        await scrollPage(page, scrollStep, scrollDelay);
        // await scrollPage(page, scrollStep, scrollDelay);
        // await scrollPage(page, scrollStep, scrollDelay);
        // await scrollPage(page, scrollStep, scrollDelay);
        // await scrollPage(page, scrollStep, scrollDelay);
        // await page.click(selectors.hide_popup); //Click hide login and signup popup

        // Get list of posts
        const posts_elems = await page.evaluate( (selectors) => {
          const posts_elemss = document.querySelectorAll(selectors.posts_elements_sel)
          const list_of_post = []
          for (var element of posts_elemss) {
              let href_elem = element.getAttribute('href')
              list_of_post.push(href_elem)
          } 
          return list_of_post
        },selectors)

        console.log(`Total ${posts_elems.length} posts`);

        var postArray = []
        for(post_link of posts_elems){
          await page.goto(`https://m.facebook.com${post_link}`)
          await page.waitFor(3000)
          await scrollPage(page, scrollStep, scrollDelay);
          await scrollPage(page, scrollStep, scrollDelay);
          try {
            // Get content in post
            // Post ID
            let post_id = post_link.split("story_fbid=")[1].split("&id")[0].split("&")[0]
            let ref_id = post_link.split("story_fbid=")[1].split("&id=")[1].split("&")[0]
            const post_text_element = await page.$eval(selectors.post_text_element_sel, el => el.innerText, selectors)
            // Get displayname in post
            const post_displayname_element = await page.$eval(selectors.post_display_name_sel, el => el.innerText, selectors)
            // Get timepublish in post
            const post_time_element = await page.$eval(selectors.post_time_sel, el => el.innerText, selectors)
            // Get profile image
            const post_imgProfile_element = await page.$eval(selectors.post_profile_image_sel, el => el.getAttribute('src'), selectors)
            
            // Get Shares
            let post_shares_element;
            try {
              post_shares_element = await page.$eval(selectors.share_element_sel, el => el.innerText, selectors)
            } catch (error) {
              post_shares_element = 0
            } 
            
            // Get post image
            const post_image_element = await page.$eval(selectors.post_image_sel, el => el.getAttribute('href'), selectors)
            // Get reactions
            let post_reaction_element;
            try {
              post_reaction_element = await page.$eval(selectors.reaction_sel, el => parseInt(el.innerText.replace('.',',').replace('k','000')), selectors)
            } catch (error) {
              post_reaction_element = null
            }

            // Get comments
            const comments_result = await page.evaluate((selectors) => {
                // console.log("comment selector",selectors.comment_elements_sel);
                let comments = []
                let comment_elements = document.querySelectorAll(selectors.comment_elements_sel)
                try {
                  for (var element of comment_elements) {
                      let cm_fb_id = element.querySelector(`div._2b05 > a`).getAttribute('href')
                      let cm_display = element.querySelector(`div._2b05 > a`).textContent
                      let cm_text = element.textContent

                      let cm_img_profile;
                      try {
                        cm_img_profile = element.querySelector(`img._1-yc.profpic`).getAttribute('style')
                      } catch (error) {
                        cm_img_profile = null
                      }

                      let cm_photo;
                      try{
                        cm_photo = element.querySelector(`div._2b1t.attachment a`).getAttribute('href')
                      } catch (error) {
                        cm_photo = null
                      }
                      
                      let cm_timestamp = element.querySelector(`abbr`).textContent
                      
                      let cm_obj = {
                        fb_id: `https://m.facebook.com${cm_fb_id}`,
                        display_name: cm_display,
                        profile_img: cm_img_profile,
                        text: cm_text.replace(cm_display,'').replace('LikeReplyMore','').replace(cm_timestamp,''),
                        photo: cm_photo,
                        timestamp: cm_timestamp
                      }
                      comments.push(cm_obj)
                  }
                } catch (error) {
                  console.log("comment error", error);
                  comments = [error.message]
                }
                return comments
            },selectors)

            let post_objects = {
              id: `https://www.facebook.com/${target}`,
              fb_id: ref_id,
              postid: post_id,
              display_name: post_displayname_element,
              profile_img: post_imgProfile_element,
              title: post_text_element,
              timestamp: post_time_element,
              photos: [`https://m.facebook.com/${post_image_element}`],
              snapshot: `https://m.facebook.com/${post_image_element}`,
              share: parseInt(post_shares_element.replace("แชร์ ","").replace(" ครั้ง","")),
              comment: comments_result,
              comment_count: parseInt(comments_result.length),
              processed: false,
              reaction: {like: post_reaction_element, share: parseInt(post_shares_element.replace("แชร์ ","").replace(" ครั้ง",""))},
              link_original: `https://m.facebook.com/story.php?story_fbid=${post_id}&id=${ref_id}`,
              timestamp_transaction: new Date()
            }
            postArray.push(post_objects)
            // console.log(post_displayname_element, '\n', post_imgProfile_element, '\n', post_time_element, '\n', post_image_element, '\n', post_text_element, '\n', post_shares_element,'\n');
          } catch (error) {
            console.error(error);
            continue
          }
          
        }
        // console.log(postArray.length, postArray);
        
        // Upload data to raw facebook collections
        var preprocess_uids = []
        for(post_obj of postArray){
          console.log("in update loop:",post_obj.postid, post_obj);
          await rawFacebook.findOneAndUpdate({postid: post_obj.postid}, post_obj, { new: true, upsert: true }, (error, doc) => {
            if(error){console.error('doc error:',error);}
            console.log(`doc : ${doc}`);
            preprocess_uids.push(doc.postid)
          });
          
        }
        console.log("uids for process:",preprocess_uids);
        // Get list uids send to celery process task
        // const result = task.applyAsync(queue='preprocess_test', kwargs={'uid': preprocess_uids});
        // result.get().then(data => {
        //   console.log(`Data schedules: ${data}`);
        //   client.disconnect();
        // });
        
    }
    
  } catch (error) {
    console.error(error);
  }
})();