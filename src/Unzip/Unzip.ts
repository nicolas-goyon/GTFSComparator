import {unzip} from 'unzipit';

async function readFilesUrl(url: string) {
  const {entries} = await unzip(url);

  // print all entries and their sizes
  for (const [name, entry] of Object.entries(entries)) {
    console.log(name, entry.size);
  }

//   // read an entry as an ArrayBuffer
//   const arrayBuffer = await entries['path/to/file'].arrayBuffer();

//   // read an entry as a blob and tag it with mime type 'image/png'
//   const blob = await entries['path/to/otherFile'].blob('image/png');
}


async function readFilesFile(file: File){
    const {entries} = await unzip(file);

    return entries;
    
    // // print all entries and their sizes
    // for (const [name, entry] of Object.entries(entries)) {
    //     console.log(name, entry.size);
    //     const text = await entry.text();
    // }
}


export {readFilesUrl, readFilesFile};