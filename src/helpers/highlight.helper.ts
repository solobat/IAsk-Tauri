import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import haskell from 'highlight.js/lib/languages/haskell'
import json from 'highlight.js/lib/languages/json'
import lisp from 'highlight.js/lib/languages/lisp'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import scheme from 'highlight.js/lib/languages/scheme'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import plaintext from 'highlight.js/lib/languages/plaintext'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('haskell', haskell)
hljs.registerLanguage('json', json)
hljs.registerLanguage('lisp', lisp)
hljs.registerLanguage('python', python)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('scheme', scheme)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('html', xml)

export default hljs