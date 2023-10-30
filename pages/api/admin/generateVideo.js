import axios from 'axios';
import { configItems } from './common';

const generateVideo = async (text, videoAssets, apiKey) => {
    const apiUrl = 'https://api.vediocreatomate.com/v1/videos'; // Replace with the Vedio Creatomate API URL

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
    };

    const payload = {
        text,
        videoAssets,
    };

    try {
        const response = await axios.post(apiUrl, payload, { headers });
        return response.data.videoUrl;
    } catch (error) {
        console.error('Error generating video:', error);
        return null;
    }
};

export default async function handler(req, res) {
    const { text, videoAssets } = req.body;

    if (!text || !videoAssets || !Array.isArray(videoAssets) || videoAssets.length === 0) {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
    }

    const VEDIO_CREATOMATE_API_KEY = await configItems('VEDIO_CREATOMATE_API_KEY');

    const apiKey = VEDIO_CREATOMATE_API_KEY; // Set the Vedio Creatomate API key from environment variables

    if (!apiKey) {
        res.status(500).json({ error: 'Missing Vedio Creatomate API key' });
        return;
    }

    try {
        const videoUrl = await generateVideo(text, videoAssets, apiKey);

        if (videoUrl) {
            res.status(200).json({ videoUrl });
        } else {
            res.status(500).json({ error: 'Failed to generate video' });
        }
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: 'Failed to generate video' });
    }
}
