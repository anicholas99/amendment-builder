#!/usr/bin/env python3

import sys
import json

def test_python_setup():
    """Test if Python and required packages are working."""
    
    print(f"✅ Python {sys.version} is working!")
    
    # Test required packages
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__} is installed")
    except ImportError:
        print("❌ OpenCV not installed. Run: pip install opencv-python")
        return False
    
    try:
        import numpy as np
        print(f"✅ NumPy {np.__version__} is installed")
    except ImportError:
        print("❌ NumPy not installed. Run: pip install numpy")
        return False
    
    try:
        import PIL
        print(f"✅ Pillow {PIL.__version__} is installed")
    except ImportError:
        print("❌ Pillow not installed. Run: pip install Pillow")
        return False
    
    print("🎉 All dependencies are installed correctly!")
    print("🚀 Strikethrough removal should work now!")
    
    return True

if __name__ == "__main__":
    try:
        if test_python_setup():
            # Return success JSON for Node.js integration
            print(json.dumps({
                "success": True, 
                "message": "Python setup is working correctly"
            }))
        else:
            print(json.dumps({
                "success": False,
                "message": "Missing dependencies"
            }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "message": "Python setup test failed"
        })) 