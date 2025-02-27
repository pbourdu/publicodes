/* eslint-disable no-console */
import chai, { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { parse } from 'yaml'
import Engine from '../src'

chai.use(sinonChai)

describe('When two different contexte are nested', function () {
	const rulesYaml = parse(`
a: 1
b: a * 2
c:
  valeur: b
  contexte:
      a: 10
d:
  valeur: c
  contexte:
    a: 100
`)
	const sandbox = sinon.createSandbox()

	beforeEach(function () {
		sandbox.spy(console, 'warn')
	})

	afterEach(function () {
		sandbox.restore()
	})

	describe('evaluation of rule on top of the chain', function () {
		it('evaluates to something', function () {
			expect(new Engine(rulesYaml).evaluate('d').nodeValue).to.eq(20)
		})

		it('does not throw any warning', function () {
			new Engine(rulesYaml).evaluate('d')
			expect(console.warn).to.have.not.been.called
		})
	})

	describe('evaluation of middle rule', function () {
		it('evaluates to something', function () {
			expect(new Engine(rulesYaml).evaluate('c').nodeValue).to.be.not.undefined
		})

		it('does not throw any warning', function () {
			new Engine(rulesYaml).evaluate('c')
			expect(console.warn).to.have.not.been.called
		})
	})
})

describe('When rule contains itself in the context', function () {
	const rules = {
		a: 100,
		b: {
			produit: ['a', '50%'],
			plafond: {
				valeur: 'b',
				contexte: {
					a: 50,
				},
			},
		},
	}
	const sandbox = sinon.createSandbox()

	beforeEach(function () {
		sandbox.spy(console, 'warn')
	})

	afterEach(function () {
		sandbox.restore()
	})

	describe('evaluation of rule', function () {
		it('evaluates properly', function () {
			expect(new Engine(rules).evaluate('b').nodeValue).to.eq(25)
		})

		it('does not throw any warning', function () {
			new Engine(rules).evaluate('b')
			expect(console.warn).to.have.not.been.called
		})
	})
})
