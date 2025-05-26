import { EventEmitter } from 'events';

let ee: EventEmitter | undefined

export const getEventEmitter = () => {
  if (!ee) {
    ee = new EventEmitter()
  }
  return ee
}

export async function resizeImageWithAspectRatio(imageUri: string, width: number, dest: string) {
    const manipulateAsync = useImageManipulator(imageUri);
    const image = await manipulateAsync.resize({
        width: width,
    }).renderAsync();
    const result = await image.saveAsync()
    FileSystem.moveAsync({
        from: result.uri,
        to: dest
    })
}

export const uniqueByProperty = (items: any[], propGetter: (_: any) => any): any[] => {
  const seen = new Set();
  return items.filter(item => {
    const propValue = propGetter(item);
    if (seen.has(propValue)) {
      return false;
    } else {
      seen.add(propValue);
      return true;
    }
  });
}

export function removeLastCharacter(str: string): string {
    const characters = Array.from(str); // 将字符串转化为字符数组
    characters.pop(); // 移除最后一个字符
    return characters.join(''); // 将剩余的字符数组合并成字符串
}