var express = require('express');
var app = express();
var http = require('http').Server(app);

app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static('public'));
var phantom = require('node-phantom-simple');

//首页
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

//二维码
app.get('/img', function (req, res) {
    var query = req.query;
    var url = query.url;
    phantom.create(function (err, ph) {
        return ph.createPage(function (err, page) {
            page.onConsoleMessage = function (msg) {
                console.log(msg);
            };
            console.log(url);
            return page.open(url, function (err, status) {
                page.includeJs("http://cdn.bootcss.com/jquery/2.1.4/jquery.min.js", function () {
                    console.log(status);
                    page.evaluate(function () {
                        console.log('start image lazy loading');
                        var $imgs = $('img');
                        var size = 0;
                        $imgs.each(function () {
                            var src = $(this).attr("src");
                            var data_src = $(this).attr("data-src")
                            if (data_src) {
                                $(this).attr("src", $(this).attr("data-src"));
                                size++;
                            }
                        });
                        return size;
                    }, function (error, result) {
                        setTimeout(function () {
                            page.renderBase64("PNG", function (error, result) {
                                var imageBuffer = new Buffer(result, 'base64');
                                res.writeHead(200, {
                                    'Content-Type': 'image/png',
                                    'Content-Length': imageBuffer.length
                                });
                                res.end(imageBuffer);
                                ph.exit()
                            });
                        }, 5000);
                    });
                });
            });
        });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
