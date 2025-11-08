(() => {
  const levelBadgeImages = [
    { value: 1, label: 'Bronze Paw', image: '../images/level/bronze.png' },
    { value: 3, label: 'Silver Whisker', image: '../images/level/silver.png' },
    { value: 5, label: 'Gold Guardian', image: '../images/level/gold.png' },
    { value: 8, label: 'Rainbow Sage', image: '../images/level/rainbow.png' }
  ];

  const makeMilestones = (values, label, emoji) =>
    values.map((value, index) => ({
      value,
      label: typeof label === 'function' ? label(value, index) : label + ' ' + (index + 1),
      emoji
    }));

  const badgeCollections = [
    {
      id: 'level',
      title: 'Level-Up Cats',
      description: 'Earn new familiars as you level up.',
      metric: 'level',
      style: 'level',
      rewards: levelBadgeImages
    },
    {
      id: 'streak',
      title: 'Streak Sparks',
      description: 'Keep the flame alive with consecutive study days.',
      metric: 'streak',
      style: 'streak',
      rewards: makeMilestones([1, 5, 10, 20], function(value) {
        return value + '-day flame';
      }, '🔥')
    },
    {
      id: 'cats',
      title: 'Cat Collectors',
      description: 'Unlock new cat personas by completing quests.',
      metric: 'cats',
      style: 'cat',
      rewards: makeMilestones([1, 3, 6, 9], function(value) {
        return value + ' quests done';
      }, '🐾')
    },
    {
      id: 'ghibli',
      title: 'Ghibli Calm',
      description: 'Special badges for reflection tasks and mindful breaks.',
      metric: 'ghibli',
      style: 'ghibli',
      rewards: makeMilestones([1, 2, 4, 6], function(value) {
        return value + ' reflection(s)';
      }, '🌙')
    }
  ];

  window.kiraBadgeCollections = badgeCollections;
})();
