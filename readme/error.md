# Error

>Error: Cannot find module 'eslint-config-defaults/configurations/eslint'

~~~javascript
$ npm install --save eslint-config-defaults
~~~
----

>The react/wrap-multilines rule is deprecated. Please use the react/jsx-wrap-multilines rule instead.

~~~javascript
eslint --init

? How would you like to configure ESLint? Answer questions about your style
? Are you using ECMAScript 6 features? Yes
? Are you using ES6 modules? Yes
? Where will your code run? Browser
? Do you use CommonJS? Yes
? Do you use JSX? No
? What style of indentation do you use? Spaces
? What quotes do you use for strings? Single
? What line endings do you use? Windows
? Do you require semicolons? Yes
? What format do you want your config file to be in? JavaScript
~~~
----

> error  Unexpected console statement  no-console

`.eslintrc.js`

~~~javascript
"rules": {
    'no-console': 'off'
}
~~~
----

>创建 gulp.task 方法时，一定要有`return`,否则会造成工作流顺序不正确

