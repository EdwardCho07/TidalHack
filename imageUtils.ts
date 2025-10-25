
export function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file."));
      }
      
      const base64Data = reader.result.split(',')[1];
      
      if (base64Data) {
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to parse base64 data from file."));
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsDataURL(file);
  });
}

export function dataUrlToGenerativePart(dataUrl: string): { inlineData: { data: string; mimeType: string; } } {
  const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URL format.");
  }
  const mimeType = match[1];
  const data = match[2];
  
  if (!mimeType || !data) {
    throw new Error("Failed to parse data URL.");
  }

  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}
