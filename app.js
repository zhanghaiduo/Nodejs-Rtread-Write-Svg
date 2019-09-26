// 使用 require 方法加载 fs 核心模块
const fs = require('fs')
const path = require("path");
const storeName = "icon";//文件夹地址
const jsonArr = [] //所有svg json数组;
const axios = require('axios');
// 遍历文件
fs.readdir(storeName, (err, files) => {
    if (err) {
        console.log('读取失败')
        return
    }
    (function iterator(i) {
        if (i == files.length) {
            //搞完，开始发送
            setTimeout(() => post(), 50);
            return;
        }
        fs.stat(path.join(storeName, files[i]), (err, data) => {
            if (data.isFile()) {
                fileChange(files[i])
            }
            iterator(i + 1);
        });
    })(0);
})
// 修改文件内容
function fileChange(file) {
    // 读取文件
    // 第一个参数就是要读取的文件路径
    // 第二个参数是一个回调函数
    fs.readFile(`${storeName}/${file}`, (err, data) => {
        if (err) {
            console.log('读取文件失败')
        } else {
            // 文件中存储的其实都是二进制数据
            // 通过 toString 方法把其转为我们认识的字符
            let name = data.toString().substring(data.toString().indexOf('<title>') + 7, data.toString().indexOf('</title>'))
            let w = data.toString().substring(data.toString().indexOf('width="') + 7, data.toString().indexOf('" height='))
            let h = data.toString().substring(data.toString().indexOf('height="') + 8, data.toString().indexOf('" viewBox='))
            let n = 0;
            let stroke = '';
            let arr = [];
            let new_data = data.toString();
            if (data.toString().includes('stroke=')) {
                stroke = data.toString().substring(data.toString().indexOf('stroke="') + 8, data.toString().indexOf('" stroke-width='))
                
            } else {
                new_data = new_data.replace('id="', 'stroke="none" id="');
                stroke = 'none'
            }
            while (data.toString().indexOf('fill="#', n) != -1) {
                let m = data.toString().indexOf('fill="#', n);
                n = m + 1;
                arr.push(data.toString().substring(n + 4, n + 13));
            }
            new_data = new_data.toString().replace(w, `%{w}`).replace(h, `%{h}`).replace(`stroke="${stroke}"`, `stroke="%{stroke}"`).replace('<svg ', '<svg preserveAspectRatio="none" ');
            for (let i = 0; i < arr.length; i++) {
                new_data = new_data.replace(`fill=${arr[i]}`, `fill="%{colors[${i}]}"`)
            }
            // console.log('```stroke', stroke)
            // console.log(new_data)
            jsonArr.push({
                width: w.replace('px', ''),
                height: h.replace('px', ''),
                stroke: stroke,
                name,
                svg: new_data,
                type: 1,
                tag: 1,
                colors: `[${arr.toString()}]`
            })
        }
    })
}
// 写文件看下JSON 没调用
function write(params) {
    fs.writeFile('test.json', params, (error) => {
        if (error) {
            console.log('写入失败')
        } else {
            console.log('写入成功了')
        }
    })
}
// 发送
async function post() {
    try {
        for (let i = 0; i < jsonArr.length; i++) {
            let data = await axios({
                url: 'http://127.0.0.1:3000/api/superAuth/shape_create',
                data: jsonArr[i],
                method: "POST",
                headers: { 'OPERATE-TOKEN': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOjk5OTksInJvbGVfaWQiOjk5OTksInJvbGVfbmFtZSI6Iui2hee6p-euoeeQhuWRmCIsImlhdCI6MTU2NDQ1NDMxOSwiZXhwIjoxNTY0NTQwNzE5fQ.z_tuyXgRgHIkayLa_g5InlsyQCBmrNpbzf-a7uYKR44' }
            })
            console.log(data.data)
        }
    } catch (err) {
        console.log(err)
    }
}
