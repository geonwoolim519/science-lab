import type { CategoryId } from '../types'

export type Category = {
  id: CategoryId
  name: string
  mark: string
  blurb: string
  color: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'physics',
    name: '물리학',
    mark: '①',
    blurb: '힘, 운동, 파동, 빛이 물체를 어떻게 바꾸는지',
    color: '#3A7CA5',
  },
  {
    id: 'chemistry',
    name: '화학',
    mark: '②',
    blurb: '원자와 분자가 만나 물질이 되는 방식',
    color: '#C47B2B',
  },
  {
    id: 'biology',
    name: '생명과학',
    mark: '③',
    blurb: '세포가 에너지를 쓰고 정보를 복제하는 과정',
    color: '#2F8F6B',
  },
  {
    id: 'earth',
    name: '지구·환경과학',
    mark: '④',
    blurb: '땅, 물, 대기가 움직이는 큰 그림',
    color: '#3D8B8B',
  },
  {
    id: 'materials',
    name: '재료과학',
    mark: '⑤',
    blurb: '원자가 쌓인 구조가 재료의 세기를 정한다',
    color: '#7A6A9A',
  },
  {
    id: 'analysis',
    name: '분석과학',
    mark: '⑥',
    blurb: '빛과 전자로 물질의 정체를 읽는다',
    color: '#B5524A',
  },
  {
    id: 'semiconductor',
    name: '반도체·전자공학',
    mark: '⑦',
    blurb: '전자의 흐름을 설계해 소자를 만든다',
    color: '#D06A2B',
  },
]

export function categoryById(id: string) {
  return CATEGORIES.find((category) => category.id === id)
}
