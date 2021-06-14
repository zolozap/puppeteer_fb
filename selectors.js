const selectors = {
        email_input: '#email',
        password_input: '#pass',
        login_submit: '[type="submit"]',
        hide_popup: 'a._3j0u',
        posts_elements_sel: 'div.story_body_container > div > a',//'a[class="_4-eo _2t9n _50z9"]',
        post_profile_image_sel: 'i.img._1-yc.profpic',//'img._1-yc.profpic.img', 
        post_display_name_sel: 'h3._52jd._52jb._52jh._5qc3._4vc-._3rc4._4vc-',
        post_time_sel: 'div._52jc._5qc4._78cz._24u0._36xo > a',
        post_text_element_sel: 'div._5rgt._5nk5',//'#fbPhotoSnowliftCaption > span',
        post_image_sel: 'a._39pi',//'div._50xr._4g6._4prr._11cc._-_b._403j > img',
        reaction_sel: 'div._1g06',
        share_element_sel: 'div._43lx._55wr',
        comment_elements_sel: 'div._2a_i',
        close_popup_post_sel: 'div._n9 > div > a'
    }

module.exports = selectors;