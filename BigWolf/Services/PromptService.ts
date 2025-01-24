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


export const answerBasedOnFilesPrompt = (data: { textFileName: string, content: string }[]) => `
Answer the question based on the ${data.length > 0 ? 'provided files with transcriptions content' : 'your existing knowledge'}. Use the fewest words possible.

${data.length > 0 ? `
    <search_results>
    ${data.map(result => `
    <search_result fileName="${result.textFileName}">
    ${result.content ? result.content : ''}
    </search_result>
    `).join('\n')}
    </search_results>

Answer has be created in JSON. Example format you can find below. It has to be a data which can be parse directly.

{
  "people": ["fileName","plik1.txt", "plik2.mp3", "plikN.png"],
  "hardware": ["fileName","plik4.txt", "plik5.png", "plik6.mp3"]
}
`
: `zero knowledge`}`;