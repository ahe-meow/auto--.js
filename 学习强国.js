auto();
console.show();
log('初始化运行到积分页面');

launch("cn.xuexi.android")

backToHomePage()
text("时评").findOne().parent().click();
text("时评").findOne().parent().click(); //两次点击刷新

var newsList = getNewsList();
var newsListLength = newsList.length - 1


//智能答题
while (!scoredOut(6)) {
    var status = text("去答题").findOne(5000)
    if (status) {
        status.click()
    }
    sleep(500)
    var status = text("智能答题，5道一组 开始答题").findOne(5000)
    if (status) {
        status.click()
    }

    sleep(1000)

    if (checkable(true).findOne(5000)) {
        checkable(true).untilFind().click()
    }

    if (editable(true).findOnce()) {
        setClip('fuck')
        editable(true).untilFind().forEach(function (edit) {
            edit.click()
            sleep(500)
            edit.paste()
            sleep(500)
        })
    }

    while (nextbtnScore = className("android.widget.Button").text('下一题').findOnce()) {
        nextbtnScore.click()
    }
    className("android.widget.Button").text('提交').findOne().click()
    className("android.widget.Button").text("提交").clickable(true).depth(22).findOne().click()
    while (!(className("android.widget.Button").text("再来一组").exists())) {
        sleep(100)
    }
};

//刷收藏
while (!scoredOut(10)) {
    backToHomePage();
    pickRandomArticle()
    sleep(500)
    text('欢迎发表你的观点').findOne().parent().child(2).click();
    log('收藏成功');
};
//刷分享
while (!scoredOut(11)) {
    backToHomePage();
    pickRandomArticle()
    sleep(500);
    text('欢迎发表你的观点').findOne().parent().child(3).click();
    className("GridView").findOne().child(2).click();
    id('ka').clickable(true).packageName('com.tencent.mm').findOne().click()
    back();
}
//刷评论
while (!scoredOut(12)) {
    backToHomePage();
    pickRandomArticle()
    sleep(500)
    text('欢迎发表你的观点').findOne().click();
    text('好观点将会被优先展示').findOne().setText('厉害了我的国！')
    text('发布').findOne().click();
    log('评论发布成功');
}
log('今天刷完拉，OJBK！');

//检查某项积分
function scoredOut(item) {
    while (!scorePage) {
        backToHomePage();
        log("尝试点击积分进入页面");
        let btnScore = id("ll_news_score").findOnce();
        if (btnScore) {
            btnScore.click();
        };
        var scorePage = id("title").text("学习积分").findOne(5000)
    };
    log("成功进入积分页面");
    let regexp = /已获(\d{1,2})分\/上限(\d{1,2})分/i;
    item--
    var current, max;
    textContains("上限").waitFor();
    textContains("上限").find().forEach(function (strScores, i) {
        if (item === i) {
            let match = regexp.exec(strScores);
            current = Number(match[1]);
            max = Number(match[2]);
            log("检查积分列表第%d项:%s", item + 1, ((current >= max) ? "已满分" : "未满分"));
        };
    });
    return (current >= max);
};

//查找<-与X按钮返回到主页
function backToHomePage() {
    log('返回到主页')
    let found = false
    let clicked = true
    let fuckBtnRedBack = threads.start(function(){
        log('子线程：不停点击红色返回按钮');
        while(clicked){
                try{
                    clicked = className('android.widget.ImageView').clickable(true).indexInParent(0).filter(function(w) {
                        return w.parent().childCount() == 2
                    }).findOne(1000).click();
                }catch(error){
                    log('无法找到红色返回按钮，停止线程');
                    fuckBtnRedBack.interrupt();
            };
        };
    });
    while (!found) {
        log("尝试点击其他返回样式");
        try {
            id("close_layout").findOnce().click();
        } catch (error) {
            try {
                id("back_layout").findOnce().click();
            } catch (error) {
                try {
                    id("back_layout").findOnce().click();
                } catch (error) {
                    try {
                        id("img_back").findOnce().click();
                    } catch (error) {
                        try {
                            log("点击所有返回样式失败，可能已返回主页。尝试点击HOME");
                            id("home_bottom_tab_button_work").findOne(1000).click();
                            found = true
                            log("返回主页成功");
                        } catch (error) {
                            found = false
                            log("并未返回主页，重试");
                        };
                    };
                };
            };
        };
    };
    fuckBtnRedBack.interrupt();
};

//获取界面新闻列表
function getNewsList() {
    log('获取文章列表');
    let frames = className("android.widget.FrameLayout").clickable(true).filter(function (a) {
        try {
            var type = a.child(1).child(0).className();
        } catch (error) {
            return false
        }
        let childCount = a.childCount();
        return (childCount === 3) && (type === 'android.widget.TextView');
    }).find()
    log('成功获取' + frames.length + '篇文章：')
    if (frames.empty()) {
        return null
    } else {
        frames.forEach(function (a, i) {
            log('%d: %s', i, a.child(1).child(0).text())
        })
        return frames
    }
};

function pickRandomArticle() {
    while (!text('欢迎发表你的观点').findOnce()) {
        let pick = random(0, newsListLength);
        let randomArticle = newsList[pick]
        log('随机选择第' + pick + '篇文章：' + randomArticle.child(1).child(0).text());
        sleep(500);
        randomArticle.click();
        text('欢迎发表你的观点').findOne(5000);
    };
};