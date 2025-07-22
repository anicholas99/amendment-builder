import sharp from 'sharp';

interface HorizontalLine {
  x1: number;
  x2: number;
  y: number;
}

export async function removeStrikethroughsCanvas(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Using PROVEN Python OpenCV solution...');
    
    // Call the Python script with your exact working OpenCV code
    const result = await callPythonStrikethroughRemoval(imageBuffer);
    
    console.log('Python OpenCV solution completed successfully');
    return result;
    
  } catch (error) {
    console.error('Error calling Python OpenCV solution:', error);
    // Fallback to original image if Python fails
    return imageBuffer;
  }
}

async function callPythonStrikethroughRemoval(imageBuffer: Buffer): Promise<Buffer> {
  const { spawn } = await import('child_process');
  const path = await import('path');
  
  // Try different Python commands in order of preference
  const pythonCommands = [
    'C:\\Users\\anthony.nicholas\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
    'python', 
    'python3', 
    'py'
  ];
  
  for (const pythonCmd of pythonCommands) {
    try {
      console.log(`Trying Python command: ${pythonCmd}`);
      const result = await tryPythonCommand(pythonCmd, imageBuffer);
      return result;
    } catch (error) {
      console.log(`${pythonCmd} failed:`, error instanceof Error ? error.message : String(error));
      continue; // Try next command
    }
  }
  
  // If all Python commands failed
  throw new Error(`Python not found. Please install Python from https://www.python.org/downloads/ and make sure to check "Add Python to PATH" during installation.`);
}

async function tryPythonCommand(pythonCmd: string, imageBuffer: Buffer): Promise<Buffer> {
  const { spawn } = await import('child_process');
  const path = await import('path');
  
  return new Promise((resolve, reject) => {
    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Path to our Python script
    const scriptPath = path.join(process.cwd(), 'src/lib/image-processing/python-strikethrough-removal.py');
    
    console.log(`Calling Python script with ${pythonCmd}: ${scriptPath}`);
    
    // Spawn Python process - no longer passing base64 as argument
    const python = spawn(pythonCmd, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`${pythonCmd} script failed:`, stderr);
        reject(new Error(`${pythonCmd} script exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        
        if (!result.success) {
          reject(new Error(`Python processing failed: ${result.error}`));
          return;
        }
        
        // Convert base64 result back to buffer
        const processedBuffer = Buffer.from(result.processedImage, 'base64');
        console.log(`Python processing successful with ${pythonCmd}: ${result.message}`);
        resolve(processedBuffer);
        
      } catch (parseError) {
        console.error('Failed to parse Python output:', stdout);
        reject(new Error(`Failed to parse Python output: ${parseError}`));
      }
    });
    
    python.on('error', (error) => {
      console.error(`Failed to start ${pythonCmd} process:`, error);
      reject(error);
    });
    
    // Send base64 data to Python via stdin instead of command line argument
    python.stdin.write(base64Image);
    python.stdin.end();
  });
}







// NUCLEAR OPTION: Completely destroy any horizontal patterns
export async function removeStrikethroughsSharp(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Starting NUCLEAR strikethrough destruction...');
    
    // Step 1: Get image info
    const metadata = await sharp(imageBuffer).metadata();
    const { width = 0, height = 0 } = metadata;
    
    // Step 2: Create EXTREME contrast
    const extremeContrast = await sharp(imageBuffer)
      .grayscale()
      .normalise()
      .linear(3.0, -(128 * 3.0 - 128)) // EXTREME contrast
      .threshold(200) // Make it pure black and white
      .toBuffer();
    
    // Step 3: Get raw pixel data and MANUALLY scan for horizontal lines
    const { data } = await sharp(extremeContrast).raw().toBuffer({ resolveWithObject: true });
    const result = Buffer.from(data);
    
    // Step 4: NUCLEAR horizontal line detection - scan every row
    console.log('Scanning for horizontal lines with NUCLEAR approach...');
    
    for (let y = 0; y < height; y++) {
      let consecutiveBlackPixels = 0;
      let lineStart = -1;
      
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pixel = data[idx];
        
        if (pixel < 128) { // Black pixel
          if (lineStart === -1) lineStart = x;
          consecutiveBlackPixels++;
        } else {
          // Check if we found a horizontal line
          if (consecutiveBlackPixels >= Math.max(20, width * 0.03)) { // Very low threshold
            console.log(`DESTROYING line at y=${y}, x=${lineStart}-${x}, length=${consecutiveBlackPixels}`);
            
            // OBLITERATE this area - make it MASSIVELY white
            for (let destroyY = Math.max(0, y - 10); destroyY <= Math.min(height - 1, y + 10); destroyY++) {
              for (let destroyX = Math.max(0, lineStart - 10); destroyX < Math.min(width, x + 10); destroyX++) {
                const destroyIdx = destroyY * width + destroyX;
                if (destroyIdx < result.length) {
                  result[destroyIdx] = 255; // PURE WHITE
                }
              }
            }
          }
          consecutiveBlackPixels = 0;
          lineStart = -1;
        }
      }
      
      // Check end of row
      if (consecutiveBlackPixels >= Math.max(20, width * 0.03)) {
        console.log(`DESTROYING end-of-row line at y=${y}, x=${lineStart}-${width}, length=${consecutiveBlackPixels}`);
        
        for (let destroyY = Math.max(0, y - 10); destroyY <= Math.min(height - 1, y + 10); destroyY++) {
          for (let destroyX = Math.max(0, lineStart - 10); destroyX < width; destroyX++) {
            const destroyIdx = destroyY * width + destroyX;
            if (destroyIdx < result.length) {
              result[destroyIdx] = 255;
            }
          }
        }
      }
    }
    
    // Step 5: Convert back to RGB and return
    const finalResult = await sharp(result, {
      raw: { width, height, channels: 1 }
    })
    .toColourspace('srgb')
    .png()
    .toBuffer();
    
    console.log('NUCLEAR strikethrough destruction completed');
    return finalResult;
    
  } catch (error) {
    console.error('Error in NUCLEAR strikethrough removal:', error);
    return imageBuffer;
  }
}