export const musicData = []
const numberOfFiles = 13

for (let i = 0; i < numberOfFiles; i++) {
    const trackSrc = `../sound/music/music_track${i}.mp3`
    musicData.push(trackSrc)
}