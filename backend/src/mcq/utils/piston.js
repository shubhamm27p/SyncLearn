const axios = require('axios');

const JDOODLE_API = 
  'https://api.jdoodle.com/v1/execute';

// JDoodle language + version IDs
// These are the stable, tested versions
const LANGUAGE_CONFIG = {
  c: {
    language: 'c',
    versionIndex: '5'
    // GCC 11.1
  },
  python: {
    language: 'python3',
    versionIndex: '4'
    // Python 3.11.1
  },
  java: {
    language: 'java',
    versionIndex: '4'
    // JDK 17.0.1
  }
};

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

const PISTON_LANG_MAP = {
  c: { language: 'c', version: '*', fileName: 'main.c' },
  python: { language: 'python', version: '*', fileName: 'main.py' },
  java: { language: 'java', version: '*', fileName: 'Main.java' }
};

const executeWithPiston = async (language, sourceCode, stdin = '') => {
  const pConfig = PISTON_LANG_MAP[language];
  if (!pConfig) {
    throw new Error('Unsupported language for Piston: ' + language);
  }

  console.log('[Piston Engine] Executing code via public compiler...');
  const response = await axios.post(
    PISTON_API,
    {
      language: pConfig.language,
      version: pConfig.version,
      files: [{ name: pConfig.fileName, content: sourceCode }],
      stdin: stdin || ''
    },
    {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    }
  );

  const run = response.data?.run || {};
  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const output = run.output || stdout || stderr || '';
  const isSuccess = run.code === 0 && !stderr;

  return {
    success: isSuccess,
    status: isSuccess ? 'Success' : (stderr.includes('Error') ? 'Runtime Error' : 'Compile Error'),
    stdout: output,
    stderr: stderr || (isSuccess ? '' : output),
    time: '0.1',
    memory: '1024'
  };
};

const executeCode = async (
  language, 
  sourceCode, 
  stdin = ''
) => {
  const config = LANGUAGE_CONFIG[language];
  
  if (!config) {
    throw new Error(
      'Unsupported language: ' + language + 
      '. Supported: c, python, java'
    );
  }

  const hasJDoodle = process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET;

  if (hasJDoodle) {
    try {
      console.log('[JDoodle] Executing:', {
        language: config.language,
        versionIndex: config.versionIndex,
        stdinLength: stdin?.length || 0,
        codeLength: sourceCode?.length || 0
      });

      const requestBody = {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: sourceCode,
        language: config.language,
        versionIndex: config.versionIndex,
        stdin: stdin || ''
      };

      const response = await axios.post(
        JDOODLE_API,
        requestBody,
        {
          timeout: 12000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      const rawOutput = result.output || '';
      const statusCode = result.statusCode || 200;

      if (statusCode === 200) {
        const hasCompileError = 
          rawOutput.includes('error:') ||
          rawOutput.includes('Error:') ||
          rawOutput.includes('SyntaxError') ||
          rawOutput.includes('IndentationError') ||
          rawOutput.includes('NameError') ||
          rawOutput.includes('TypeError') ||
          rawOutput.includes('Exception in thread') ||
          rawOutput.includes('Traceback') ||
          statusCode === 400;

        return {
          success: !hasCompileError,
          status: hasCompileError ? 'Runtime Error' : 'Success',
          stdout: rawOutput,
          stderr: hasCompileError ? rawOutput : '',
          time: result.cpuTime || '0',
          memory: result.memory || '0'
        };
      }
      console.warn('[JDoodle] Non-200 response, switching to Piston fallback:', statusCode);
    } catch (jdoodleErr) {
      console.warn('[JDoodle] Execution failed, falling back to Piston:', jdoodleErr.message);
    }
  }

  // Fallback to Piston API
  try {
    return await executeWithPiston(language, sourceCode, stdin);
  } catch (pistonErr) {
    console.error('[Execution Error] Both compilers failed:', pistonErr.message);
    return {
      success: false,
      status: 'Execution Error',
      stdout: '',
      stderr: `Code execution failed: ${pistonErr.message}. Ensure internet connection is available.`,
      time: '0',
      memory: '0'
    };
  }
};

module.exports = { executeCode };
