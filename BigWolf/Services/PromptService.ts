export const answerBasedOnAudioFilesPrompt = (audioData: { audioFileName: string, content: string }[]) => `
Answer the question based on the ${audioData.length > 0 ? 'provided audio files transcription content' : 'your existing knowledge'}. Use the fewest words possible.

${audioData.length > 0 ? `
    <search_results>
    ${audioData.map(result => `
    <search_result audioFileName="${result.audioFileName}">
    ${result.content ? result.content : ''}
    </search_result>
    `).join('\n')}
    </search_results>

Answer using the most relevant fragments.`
: `zero knowledge`}`;