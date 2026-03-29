import { vi } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { SpotDetail } from '../../features/spots/components/SpotDetail';

// useSpot をモック（Supabase に繋がずダミーデータを返す）
vi.mock('../../features/spots/hooks/useSpot', () => ({
  useSpot: vi.fn(),
}));

import { useSpot } from '../../features/spots/hooks/useSpot';
const mockUseSpot = vi.mocked(useSpot);

const meta: Meta<typeof SpotDetail> = {
  component: SpotDetail,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SpotDetail>;

export const 画像なし: Story = {
  args: { spotId: '1', onClose: () => {} },
  beforeEach: () => {
    mockUseSpot.mockReturnValue({
      spot: {
        id: '1',
        name: '隠れた名所',
        description: '地元の人しか知らない静かな場所です。',
        image_url: null,
        user_id: 'user_abc123',
      },
      loading: false,
      error: null,
    });
  },
};

export const 画像あり: Story = {
  args: { spotId: '2', onClose: () => {} },
  beforeEach: () => {
    mockUseSpot.mockReturnValue({
      spot: {
        id: '2',
        name: '絶景スポット',
        description: '夕日が最高に美しい場所。地元民おすすめ。',
        image_url: 'https://picsum.photos/640/360',
        user_id: 'user_xyz456',
      },
      loading: false,
      error: null,
    });
  },
};

export const ローディング中: Story = {
  args: { spotId: '3', onClose: () => {} },
  beforeEach: () => {
    mockUseSpot.mockReturnValue({
      spot: null,
      loading: true,
      error: null,
    });
  },
};

export const エラー: Story = {
  args: { spotId: '4', onClose: () => {} },
  beforeEach: () => {
    mockUseSpot.mockReturnValue({
      spot: null,
      loading: false,
      error: 'データの取得に失敗しました',
    });
  },
};

export const 長いテキスト: Story = {
  args: { spotId: '5', onClose: () => {} },
  beforeEach: () => {
    mockUseSpot.mockReturnValue({
      spot: {
        id: '5',
        name: 'スポット名が非常に長い場合のレイアウト確認用スポット',
        description:
          '説明文が非常に長い場合のレイアウトを確認するためのサンプルテキストです。改行や折り返しが正しく動作するかを確認します。さらに長いテキストが続きます。観光地としての魅力が伝わるような説明文を書くとこのくらいの長さになることがあります。',
        image_url: null,
        user_id: 'user_long_name_user',
      },
      loading: false,
      error: null,
    });
  },
};
