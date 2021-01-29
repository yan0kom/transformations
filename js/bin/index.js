#!/usr/bin/env node

'use strict'
console.log('do transform')

const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const {SaxParser} = require('sax-parser')
const xmlBuilder = require('xmlbuilder');

const validTags = ['ns1:input', 'ns1:element', 'ns2:field1', 'ns2:field2', 'ns2:field3']
const validAttrs = ['xmlns:ns1', 'xmlns:ns2', 'id']

function writeOutput(prefix, fn, data) {
    var ffn = path.normalize(__dirname + '/../data/' + fn)
    fs.writeFile(ffn, data, 'utf8', () => {
        console.log(prefix + ': put output to ' + ffn)
    })
}

// Парсинг xml с использованием xml2js и преобразование получившегося json в требуемый вид
function out21_xml2js(data) {	
	var parser = new xml2js.Parser({
        tagNameProcessors: [
            (name) => {
                if (validTags.indexOf(name) == -1) {
                    throw 'Unexpected node name: ' + name
                }
                return name
            }
        ],
        attrNameProcessors: [
            (name) => {
                if (validAttrs.indexOf(name) == -1) {
                    throw 'Unexpected attr name: ' + name
                }
                return name
            }
        ],
    })
	parser.parseString(data, function (err, obj) {
        if (err != undefined) {
            console.error(err)
            return
        }
        //console.log(JSON.stringify(obj, null, 2))

        var out = {elements: []}
        obj['ns1:input']['ns1:element'].forEach(in_elem => {
            var elem = {element: {}}
            for (var i = 1; i <= 3; ++i) {
                elem.element['field'+i] = in_elem['ns2:field'+i][0]
            }
            elem.element.id = in_elem.$.id
            out.elements.push(elem)
        })

        writeOutput('xml2js', 'output-2-1-xml2js.json', JSON.stringify(out, null, 2))
	})
}

// Парсинг xml с использованием sax-parser с образованием json требуемого вида
function out21_saxParser(data) {

    function getAttrValue(qname, attrs, attr_name) {
        var attr = attrs.find(attr => attr[0] == attr_name)
        if (attr == undefined) {
            throw 'Attribute ' + attr_name + ' not found in node ' + qname
        }
        return attr[1]
    }

    var out = {elements: []}
    var out_elem = undefined
    var out_field_name = undefined
    var out_elem_id = undefined
    var withinInput = false
    var withinElement = false
    var withinField = false
    var level = 0
    var parser = new SaxParser((sax) => {
        sax.onStartDocument(() => {})
        sax.onEndDocument(() => {})
        sax.onStartElementNS((name, attrs, prefix, uri, namespaces) => {
            var qname = prefix + ':' + name
            //console.log('onStart: qname=' + qname + ' uri=' + uri +
            //    ' attrs: ' + JSON.stringify(attrs) + ' namespaces: ' + JSON.stringify(namespaces))
            if (validTags.indexOf(qname) == -1) {
                throw 'Unexpected node name: ' + qname
            }
            ++level
            if (qname == 'ns1:input') {
                if (level != 1) {
                    throw 'Misplaced node: ' + qname
                }
                withinInput = true
            } else if (qname == 'ns1:element') {
                if (!withinInput || level != 2) {
                    throw 'Misplaced node: ' + qname
                }
                withinElement = true                
                out_elem_id = getAttrValue(qname, attrs, 'id')
                out_elem = {}
            } else if (qname.startsWith('ns2:field')) {
                if (!withinElement || level != 3) {
                    throw 'Misplaced node: ' + qname
                }
                withinField = true
                out_field_name = name                
            }
        })
        sax.onEndElementNS((name, prefix, uri) => {
            var qname = prefix + ':' + name
            //console.log('onEnd: qname=' + qname + '\n')
            --level
            if (qname == 'ns1:input') {
                withinInput = false
            } else if (qname == 'ns1:element') {
                withinElement = false
                if (out_elem != undefined) {
                    out_elem.id = out_elem_id
                    out.elements.push({element: out_elem})
                    out_elem = out_elem_id = undefined
                }
            } else if (qname.startsWith('ns2:field')) {
                withinField = false
                out_field_name = undefined
            }
        })
        sax.onCharacters((chars) => {
            //console.log('onChars: ' + chars)
            if (withinField) {
                out_elem[out_field_name] = chars
            }
        })
        sax.onCdata((cdata) => {
            //console.log('onCdata: ' + cdata)
        })
        sax.onComment((msg) => {
            //console.log('onComment: ' + msg)
        })
        sax.onWarning((msg) => {
            //console.log('onWarn: ' + msg)
        })
        sax.onError((msg) => {
            throw 'Parser error: ' + JSON.stringify(msg)
        })
    })
    parser.parseString(data)
    writeOutput('sax-parser', 'output-2-1-sax-parser.json', JSON.stringify(out, null, 2))
}

// преобразование исходного json в json для создания xml с использованием xml2js
function out22_xml2js(data) {
    var json = JSON.parse(data)
    //console.log(JSON.stringify(json, null, 2))
    
    var out = {'ns1:input': {$: {'xmlns:ns1': 'ns1:test', 'xmlns:ns2': 'ns2:test'}, 'ns1:element': []}}
    json.elements.forEach((in_elem) => {
        var elem = {$: {id: in_elem.element.id}}
        for (var i = 1; i <= 3; ++i) {
            elem['ns2:field'+i] = in_elem.element['field'+i]
        }
        out['ns1:input']['ns1:element'].push(elem)
    })
    //console.log(JSON.stringify(out, null, 2))

    var builder = new xml2js.Builder({headless: true});
    var xml = builder.buildObject(out);
    writeOutput('xml2js', 'output-2-2-xml2js.xml', xml)
}

// создание xml из исходного json с использованием xmlbuilder
function out22_xmlBuilder(data) {
    var json = JSON.parse(data)
    if (json.elements == undefined) {
        throw 'Required field undefined: elements'
    }
    var xml = xmlBuilder.create('ns1:input', {headless: true})
        .att('xmlns:ns1', 'ns1:test')
        .att('xmlns:ns2', 'ns2:test')
    json.elements.forEach((in_elem) => {
        if (in_elem.element == undefined) {
            throw 'Required field undefined: elements/element'
        }
        if (in_elem.element.id == undefined) {
            throw 'Required field undefined: elements/element/id'
        }
        xml = xml.ele('ns1:element', {id: in_elem.element.id})
        for (var i = 1; i <= 3; ++i) {
            if (in_elem.element['field'+i] == undefined) {
                throw 'Required field undefined: elements/element/ns2:field'+i
            }
            xml = xml.ele('ns2:field'+i, in_elem.element['field'+i]).up()
        }
        xml = xml.up()
    })
    xml = xml.end({ pretty: true })
    writeOutput('xmlbuilder', 'output-2-2-xmlbuilder.xml', xml)
}

fs.readFile(__dirname + '/../data/input-2-1.xml', function(err, data) {
    if (err == undefined) {
        try {
            out21_xml2js(data)
            out21_saxParser(data)
        } catch (err) {
            console.error(err)
        }
    } else {
        console.error(JSON.stringify(err, null, 2))
    }
})

fs.readFile(__dirname + '/../data/input-2-2.json', function(err, data) {
    if (err == undefined) {
        try {
            out22_xml2js(data)
            out22_xmlBuilder(data)
        } catch (err) {
            console.error(err)
        }
    } else {
        console.error(JSON.stringify(err, null, 2))
    }
})
