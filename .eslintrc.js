// http://eslint.org/docs/user-guide/configuring
module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    globals: {
        'TimelineLite': true,
        'TimelineMax': true,
        'TweenLite': true,
        'TweenMax': true,
        'Back': true,
        'Bounce': true,
        'Circ': true,
        'Cubic': true,
        'Ease': true,
        'EaseLookup': true,
        'Elastic': true,
        'Expo': true,
        'Linear': true,
        'Power0': true,
        'Power1': true,
        'Power2': true,
        'Power3': true,
        'Power4': true,
        'Quad': true,
        'Quart': true,
        'Quint': true,
        'RoughEase': true,
        'Sine': true,
        'SlowMo': true,
        'SteppedEase': true,
        'Strong': true,
        'Draggable': true,
        'SplitText': true,
        'VelocityTracker': true, 
        'CSSPlugin': true,
        'ThrowPropsPlugin': true, 
        'BezierPlugin': true,
    },
    // add your custom rules here
    rules: {
        'comma-dangle': ['off'],
        'padded-blocks': 0,
        'no-unused-vars': ['warn'],
        'no-undef': ['warn'],
        'quotes': ['off'],
        'no-console': ['off'],
        'max-len': ['off'],
        'semi': ['off', 'always'],
        'space-before-blocks': ['off'],
        'space-before-function-paren': ['off'],
        'camelcase': ['warn'],
        'comma-style': ['warn', 'last'],
        'spaced-comment': ['off'],
        'indent': [1, 4, {
            'SwitchCase': 1
        }],
    }
}
