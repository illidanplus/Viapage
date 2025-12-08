/**
 * 百度搜索功能核心逻辑
 * 对接百度官方联想接口，实现搜索建议和搜索跳转
 */
'use strict';

// 百度搜索提交处理
function search() {
    try {
        const inputEl = document.getElementById('search_input');
        if (!inputEl) return false;

        const query = inputEl.value.trim();
        if (!query) {
            inputEl.focus();
            return false;
        }

        // 百度搜索官方链接
        const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_blank');
        
        // 清空输入并关闭建议
        inputEl.value = '';
        close_sug();
    } catch (error) {
        console.error('百度搜索提交异常:', error);
    }
    return false; // 阻止表单默认提交
}

// 清除搜索输入内容
function clear_seach() {
    try {
        const inputEl = document.getElementById('search_input');
        const suggestEl = document.getElementById('suggest');
        if (inputEl) inputEl.value = '';
        if (suggestEl) suggestEl.style.display = 'none';
        // 隐藏清除按钮
        const clearEl = document.getElementById('clear');
        if (clearEl) clearEl.style.display = 'none';
    } catch (error) {
        console.error('清除搜索内容异常:', error);
    }
}

// 关闭搜索建议面板
function close_sug() {
    try {
        const suggestEl = document.getElementById('suggest');
        if (suggestEl) suggestEl.style.display = 'none';
    } catch (error) {
        console.error('关闭搜索建议异常:', error);
    }
}

// 获取百度官方搜索建议
function getBaiduSuggest() {
    try {
        const inputEl = document.getElementById('search_input');
        const suggestEl = document.getElementById('suggest');
        const sugListEl = document.getElementById('suglist');
        const clearEl = document.getElementById('clear');
        
        if (!inputEl || !suggestEl || !sugListEl) return;

        const query = inputEl.value.trim();
        if (!query) {
            suggestEl.style.display = 'none';
            if (clearEl) clearEl.style.display = 'none';
            return;
        }

        // 显示清除按钮
        if (clearEl) clearEl.style.display = 'block';

        // 百度联想接口（JSONP方式，避免跨域）
        const callbackName = `baidu_sug_${Date.now()}`;
        window[callbackName] = function(data) {
            try {
                // 解析百度返回的建议数据
                const suggestions = data?.s || [];
                if (suggestions.length === 0) {
                    suggestEl.style.display = 'none';
                    return;
                }

                // 渲染百度搜索建议列表
                sugListEl.innerHTML = suggestions.map(item => 
                    `<li onclick="selectBaiduSuggestion('${encodeURIComponent(item)}')">${item}<b></b></li>`
                ).join('');

                // 显示建议面板
                suggestEl.style.display = 'block';
            } catch (err) {
                console.error('解析百度建议数据异常:', err);
            } finally {
                // 清理回调函数
                delete window[callbackName];
            }
        };

        // 动态创建script标签请求百度接口
        const script = document.createElement('script');
        script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&cb=${callbackName}&prod=pc`;
        script.charset = 'utf-8';
        script.onload = function() {
            document.body.removeChild(script);
        };
        script.onerror = function() {
            console.error('百度建议接口请求失败');
            document.body.removeChild(script);
            delete window[callbackName];
        };
        document.body.appendChild(script);

    } catch (error) {
        console.error('获取百度搜索建议异常:', error);
    }
}

// 选择百度搜索建议项
function selectBaiduSuggestion(encodedQuery) {
    try {
        const query = decodeURIComponent(encodedQuery);
        // 跳转到百度搜索结果页
        const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_blank');
        
        // 清空输入并关闭建议
        clear_seach();
    } catch (error) {
        console.error('选择百度搜索建议异常:', error);
    }
}

// 搜索框滚动定位优化
function move_input() {
    try {
        const searchForm = document.getElementById('search_form');
        if (searchForm) {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: searchForm.offsetTop - 2,
                    behavior: 'smooth'
                });
            });
        }
    } catch (error) {
        console.error('滚动定位异常:', error);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 监听输入框焦点事件
    const inputEl = document.getElementById('search_input');
    if (inputEl) {
        inputEl.addEventListener('blur', () => {
            // 延迟关闭，避免点击建议项时立即关闭
            setTimeout(() => {
                const suggestEl = document.getElementById('suggest');
                if (suggestEl) suggestEl.style.display = 'none';
            }, 200);
        });

        // 输入框获得焦点时显示清除按钮（如果有内容）
        inputEl.addEventListener('focus', () => {
            const clearEl = document.getElementById('clear');
            if (clearEl && inputEl.value.trim()) {
                clearEl.style.display = 'block';
            }
        });
    }
});
