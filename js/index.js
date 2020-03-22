window.onload = function(){
    // 1.顶部搜索
    search();
    // 2.轮播图
    banner();
    // 3.倒计时
    downTime();
};
// 如果在onload里一起定义，可能造成变量作用域的混乱，在下面单独定义，每个方法有独立的作用域,互不影响
var search = function(){
    var searchBox = document.querySelector(".jd_search_box"); //搜索框
    var banner = document.querySelector(".jd_banner"); //轮播图
    var height = banner.offsetHeight;   //轮播图的高度
    // 监听页面滚动事件
    window.onscroll = function(){
        var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
        // 获取卷曲高度，有三种方法，适用于不同的浏览器
        console.log(document.documentElement.scrollTop); //支持谷歌浏览器
        console.log(document.body.scrollTop);
        console.log(window.pageYOffset);
        // 在顶部的时候默认透明度为0
        var opacity = 0; //默认透明度为0
        if (scrollTop < height) {
            // 当页面滚动的时候---随着页面卷曲的高度变大透明度变大
            opacity = scrollTop / height * 0.85;
        } else {
            // 超过某一个高度的时候透明度不变
            opacity = 0.85;
        }
        searchBox.style.background = 'rgba(201,21,35,' + opacity + ')';
    };
};

var banner = function () {
    /*1. 自动轮播图且无缝   方法：定时器，过渡（css3）*/
    /*2. 点要随着图片的轮播改变  方法：根据索引切换*/
    /*3. 滑动效果  利用touch事件完成*/
    /*4. 滑动结束的时候    如果滑动的距离不超过屏幕的1/3  吸附回去   方法：过渡*/
    /*5. 滑动结束的时候    如果滑动的距离超过屏幕的1/3  切换（上一张，下一张） 方法：根据滑动的方向，过渡*/

    /*轮播图容器，作用：获取屏幕宽度，滑动的时候需要和屏幕宽度做比较*/
    var banner = document.querySelector('.jd_banner');
    // 屏幕宽度
    var width = banner.offsetWidth;
    // 图片容器
    var imageBox = document.querySelector('ul:first-child');
    // 点容器
    var pointBox = document.querySelector('ul:last-child');
    /*所有的点*/
    var points = pointBox.querySelectorAll('li');

    // 加过渡
    var addTransition = function () {
        imageBox.style.transition = 'all 0.5s';
        imageBox.style.webkitTransition = 'all 0.5s';
    }
    // 清除过渡
    var removeTransition = function () {
        imageBox.style.transition = 'none';
        imageBox.style.webkitTransition = 'none';
    }
    // 封装位移函数
    var setTranslateX = function (translateX) {
        imageBox.style.transform = 'translateX(' + translateX + 'px)';
        imageBox.style.webkitTransform = 'translateX(' + translateX + 'px)';
    }

    // 轮播图程序的核心：index（索引）
    var index = 1; //刚开始是显示第二张图片（索引为1的图片）
    var timer = setInterval(function () {
        index++; //imageBox向左移动
        /*imageBox加过渡*/
        addTransition();
        /*imageBox基于index做位移*/
        setTranslateX(-index * width);
        console.log(index)
    }, 2000);

    /*需要等最后一张动画结束去判断 是否瞬间定位到第一张*/
    imageBox.addEventListener('transitionend', function () {
        console.log(index)
        /*1.自动滚动的时候的无缝*/
        // 每次动画结束之后判断当前的索引
        if (index >= 9) {
            /*瞬间定位，索引设为1，定位之后需要清过渡，再做位移*/
            index = 1;
            removeTransition();
            /*瞬间定位，做位移*/
            setTranslateX(-index * width);
        }else if (index <= 0) { /*2.滑动的时候也需要无缝，滑动到第0张，瞬间移动到第8张*/
            index = 8;
            /*瞬间定位*/
            /*清过渡*/
            removeTransition();
            /*做位移*/
            setTranslateX(-index * width);
        }
        /*根据索引设置点*/
        /*此时此刻  index  的取值范围  1-8（0变成8，9变成1）*/
        /*点的索引就是index - 1 */
        setPoint();
    });

    /*设置点的方法*/
    var setPoint = function () {
        /*index 1-8*/
        /*清除样式*/
        for (var i = 0; i < points.length; i++) {
            var obj = points[i];
            obj.classList.remove('now');
        }
        /*给对应的点加上样式*/
        points[index - 1].classList.add('now');
    }

    /*绑定事件*/
    // 因为作用域的问题，在外面设置变量，这样下面三个绑定方法就能用到以下三个变量
    var startX = 0; //位置，X坐标
    var distanceX = 0; //位移
    var isMove = false; //为了程序的健壮性，没有滑动的时候不切换
    imageBox.addEventListener('touchstart', function (e) {
        /*当手指点到轮播图，清除定时器,暂停轮播*/
        clearInterval(timer);
        /*记录起始位置的X坐标*/
        startX = e.touches[0].clientX;

    });
    imageBox.addEventListener('touchmove', function (e) {
        /*记录滑动过程当中的X坐标*/
        var moveX = e.touches[0].clientX;
        /*计算X方向的位移， 注意有正负方向*/
        distanceX = moveX - startX;
        /*计算目标元素的位移*/
        /*元素将要的定位=当前定位+手指移动的距离*/
        var translateX = -index * width + distanceX;
        /*滑动原理：元素随着手指的滑动做位置的改变*/
        removeTransition(); //如果没有清除过渡，图片跟着手指动的时候会有0.2s延时
        setTranslateX(translateX);
        isMove = true;

    });
    imageBox.addEventListener('touchend', function (e) {
        /*4.  5.  实现*/
        /*要使用移动的距离*/
        if (isMove) { //只有做了滑动之后，才做吸附或者切换效果
            // 如果移动的距离小于屏幕的1/3
            if (Math.abs(distanceX) < width / 3) {
                /*吸附，要以动画的形式，所以要加过渡*/
                addTransition();
                setTranslateX(-index * width);
            } else {
                /*切换*/
                /*右滑动 上一张*/
                if (distanceX > 0) {
                    index--;
                }
                /*左滑动 下一张*/
                else {
                    index++;
                }
                /*根据index去做动画的移动*/
                addTransition(); //加过渡
                setTranslateX(-index * width); //做位移
            }
        }
        /*最好做一次参数的重置*/
        startX = 0;
        distanceX = 0;
        isMove = false;
        /*加上定时器*/
        clearInterval(timer); //先清除定时器，为了严谨，防止多次设置定时器
        timer = setInterval(function () {
            index++;
            /*加过渡*/
            addTransition();
            /*做位移*/
            setTranslateX(-index * width);
        }, 2000);
    });
};

var downTime = function () {
    /*1.每一秒改变当前的时间*/
    /*2.倒数计时  假设 4小时*/
    var time = 4 * 60 * 60;
    var spans = document.querySelectorAll('.time span');

    var timer = setInterval(function () {
        time --;
        /*格式化  给不同的元素html内容*/
        var h = Math.floor(time/3600);
        var m = Math.floor(time%3600/60);
        var s = Math.floor(time%60);

        spans[0].innerHTML = Math.floor(h/10);
        spans[1].innerHTML = h%10;
        spans[3].innerHTML = Math.floor(m/10);
        spans[4].innerHTML = m%10;
        spans[6].innerHTML = Math.floor(s/10);
        spans[7].innerHTML = s%10;

        if(time <= 0){ //倒计时结束，清除定时器
            clearInterval(timer);
        }

    }, 1000);
};