import * as tmImage from '@teachablemachine/image';

export interface TeachableMachinePrediction {
  className: string;
  probability: number;
}

export class TeachableMachineModel {
  private model: tmImage.CustomMobileNet | null = null;
  private modelURL: string;
  private metadataURL: string;

  constructor(modelURL: string) {
    // Teachable Machine model URLs should be in format:
    // https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/
    this.modelURL = modelURL + 'model.json';
    this.metadataURL = modelURL + 'metadata.json';
  }

  // Load the model
  async load(): Promise<void> {
    try {
      this.model = await tmImage.load(this.modelURL, this.metadataURL);
      console.log('Teachable Machine model loaded successfully');
    } catch (error) {
      console.error('Error loading Teachable Machine model:', error);
      throw new Error('Failed to load AI model');
    }
  }

  // Predict from image element (video frame or img tag)
  async predict(imageElement: HTMLImageElement | HTMLVideoElement): Promise<TeachableMachinePrediction[]> {
    if (!this.model) {
      throw new Error('Model not loaded. Call load() first.');
    }

    try {
      const predictions = await this.model.predict(imageElement);
      return predictions.map(p => ({
        className: p.className,
        probability: p.probability,
      }));
    } catch (error) {
      console.error('Error making prediction:', error);
      throw new Error('Prediction failed');
    }
  }

  // Get the top prediction
  async predictTop(imageElement: HTMLImageElement | HTMLVideoElement): Promise<TeachableMachinePrediction> {
    const predictions = await this.predict(imageElement);
    return predictions.reduce((prev, current) => 
      current.probability > prev.probability ? current : prev
    );
  }

  // Check if model is loaded
  isLoaded(): boolean {
    return this.model !== null;
  }

  // Dispose of the model
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

// Helper function to map Teachable Machine predictions to fatigue levels
export function mapPredictionToFatigueLevel(prediction: TeachableMachinePrediction): {
  level: 'alert' | 'tired' | 'rested';
  confidence: number;
} {
  const className = prediction.className.toLowerCase();
  const confidence = prediction.probability;

  // Map based on your Teachable Machine class names
  if (className.includes('drowsy') || className.includes('sleepy') || className.includes('yawn')) {
    return { level: 'alert', confidence };
  } else if (className.includes('tired') || className.includes('fatigue')) {
    return { level: 'tired', confidence };
  } else {
    // awake, focused, normal, etc.
    return { level: 'rested', confidence };
  }
}
