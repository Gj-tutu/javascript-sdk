import * as fauxJax from 'faux-jax';
import * as expect from 'expect';
import * as assign from 'lodash/assign';
import * as omit from 'lodash/omit';

import { setupJsDom, teardownJsDom } from './jsdom-helper';

import {
  jsonpRequestMethodCase,
  jsonpByDefaultRequestMethodCase,
  postRequestMethodCase,
  userParamValidationCase,
  userParamRequestBodyAtConfigurationCase,
  userParamRequestBodyAtRequestCase,
  timestampAddingCase,
  logConfigParamCase,
  keyParamsInHeadersCase,
  jsonpCallbackPrefixCase,
  apiHostnameCase,
  uidParamExistanceAtConfigurationCase,
  uidParamExistanceAtRequestCase,
  sidParamExistanceAtConfigurationCase,
  sidParamExistanceAtRequestCase,
} from './generic-helper';

import FindifySDK from '../src/index';

describe('FindifySDK', () => {
  beforeEach(() => {
    fauxJax.install();
  });

  afterEach(() => {
    fauxJax.restore();
  });

  const key = 'testApiKey';
  const user = {
    uid: 'testUserId',
    sid: 'testSessionId',
  };

  describe('generic', () => {
    it('should be instantiated', () => {
      const sdk = new FindifySDK({ key });
    });

    it('should throw validation error if "key" param is not provided', () => {
      expect(() => new (FindifySDK as any)()).toThrow(/"key" param is required/);
      expect(() => new (FindifySDK as any)({})).toThrow(/"key" param is required/);
    });

    // it('should throw validation error if "key" param is not string', () => {
    //   expect(() => new FindifySDK({ key: 1 })).toThrow(/"key" param should be a string/);
    // });
  });

  describe('autocomplete', () => {
    const makeAutocomplete = (sdk) => {
      sdk.autocomplete({
        q: 'test',
      });
    }

    it('should use jsonp by default if "method" is not provided at config', jsonpByDefaultRequestMethodCase(makeAutocomplete));
    it('should use jsonp if { method: "jsonp" } is provided', jsonpRequestMethodCase(makeAutocomplete));
    it('should use POST if { method: "post" } is provided', postRequestMethodCase(makeAutocomplete));
    it('should throw an Error if "user" param is not provided neither at configuration nor in request', userParamValidationCase(makeAutocomplete));
    it('should add "user" param to request body if it`s provided at sdk initialization', userParamRequestBodyAtConfigurationCase(makeAutocomplete));
    it('should add "t_client" param to request body', timestampAddingCase(makeAutocomplete));
    it('should add "log" param to request body if it`s provided at sdk initialization', logConfigParamCase(makeAutocomplete));
    it('should provide "key" param to headers', keyParamsInHeadersCase(key, makeAutocomplete));
    it('should add jsonp callback prefix as "findifyCallback"', jsonpCallbackPrefixCase(makeAutocomplete));
    it('it should send requests to "https://api-v3.findify.io"', apiHostnameCase(makeAutocomplete));
    it('should throw validation Error if "user.uid" param is not provided at library configuration', uidParamExistanceAtConfigurationCase(makeAutocomplete));
    it('should throw validation Error if "user.sid" param is not provided at library configuration', sidParamExistanceAtConfigurationCase(makeAutocomplete));

    it('should add "user" param to request body if it`s provided as a request method param', userParamRequestBodyAtRequestCase(user, (sdk) => {
      sdk.autocomplete({
        q: 'test',
        user,
      });
    }));

    it('should throw validation Error if "user.uid" param is not provided at request', uidParamExistanceAtRequestCase((sdk) => {
      (sdk as any).autocomplete({
        q: 'test',
        user: {
          sid: 'testSessionId',
        },
      });
    }));

    it('should throw validation Error if "user.sid" param is not provided at request', sidParamExistanceAtRequestCase((sdk) => {
      (sdk as any).autocomplete({
        q: 'test',
        user: {
          uid: 'testUserId',
        },
      });
    }));

    it('should add passed request params to request body', (done) => {
      const request = {
        q: 'test',
        suggestion_limit: 10,
        item_limit: 15,
      };

      fauxJax.on('request', (req) => {
        const requestBody = omit(JSON.parse(req.requestBody), ['t_client']);

        expect(requestBody).toEqual(assign({}, {
          user,
        }, request));

        done();
      });

      const sdk = new FindifySDK({
        key,
        method: 'post',
        user,
      });

      sdk.autocomplete(request);
    });

    it('should throw validation Error if "q" param is not provided', () => {
      const sdk = new FindifySDK({
        key,
        method: 'post',
        user: {
          uid: 'testUserId',
          sid: 'testSessionId',
        },
      });

      const errorRegex = /"q" param is required/;

      expect(() => (sdk as any).autocomplete()).toThrow(errorRegex);
      expect(() => (sdk as any).autocomplete({})).toThrow(errorRegex);
    });
  });
});
