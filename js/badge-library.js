(() => {
  const levelBadgeImages = [
    { value: 1, label: 'Bronze Paw', image: '../images/level/bronze.png' },
    { value: 3, label: 'Silver Whisker', image: '../images/level/silver.png' },
    { value: 5, label: 'Gold Guardian', image: '../images/level/gold.png' },
    { value: 8, label: 'Rainbow Sage', image: '../images/level/rainbow.png' }
  ];

  const streakPlantStages = [
    {
      value: 0,
      label: 'Dormant Seed',
      image: '../images/streak/0.png',
      hint: 'Start your streak to wake the seed.',
      description: 'Every habit begins with the first study day.'
    },
    {
      value: 1,
      label: 'Day 1 Sprout',
      image: '../images/streak/1.png',
      hint: 'Log two consecutive study days.',
      description: 'Fresh sprouts say hi!'
    },
    {
      value: 2,
      label: 'Day 2 Roots',
      image: '../images/streak/2.png',
      hint: 'Keep going for one more day.',
      description: 'Roots are settling in.'
    },
    {
      value: 3,
      label: 'Day 3 Leaves',
      image: '../images/streak/3.png',
      hint: 'Reach a 3-day streak.',
      description: 'Leaves appear—momentum unlocked.'
    },
    {
      value: 4,
      label: 'Day 4 Growth',
      image: '../images/streak/4.png',
      hint: 'Study four days in a row.',
      description: 'Halfway to bloom.'
    },
    {
      value: 5,
      label: 'Day 5 Thrive',
      image: '../images/streak/5.png',
      hint: 'One more day keeps the plant thriving.',
      description: 'This plant loves your consistency.'
    },
    {
      value: 6,
      label: 'Day 6 Radiance',
      image: '../images/streak/6.png',
      hint: 'Stay on track through day six.',
      description: 'Radiant leaves everywhere.'
    },
    {
      value: 7,
      label: 'Full Bloom',
      image: '../images/streak/7.png',
      hint: 'Keep the bloom alive by never breaking your streak.',
      description: 'Full bloom unlocked—guard it well.'
    }
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
      rewards: streakPlantStages
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
    },
    {
      id: 'hidden',
      title: 'Hidden Relics',
      description: 'Unique challenges that only appear when you do something special.',
      metric: 'hidden',
      style: 'hidden',
      secret: true,
      rewards: [
        {
          value: 1,
          label: 'Bronze Whisper',
          lockedLabel: 'Bronze Secret',
          image: '../images/hidden/bronze.png',
          hint: 'Complete onboarding in under 90 seconds.',
          description: 'You sprinted through onboarding with flawless focus.'
        },
        {
          value: 2,
          label: 'Silver Echo',
          lockedLabel: 'Silver Secret',
          image: '../images/hidden/silver.png',
          hint: 'Finish three missions without breaking your streak.',
          description: 'Consistency unlocked this silver companion.'
        },
        {
          value: 3,
          label: 'Gold Whisper',
          lockedLabel: 'Gold Secret',
          image: '../images/hidden/gold.png',
          hint: 'Score 95%+ on a timed mastery quiz.',
          description: 'Your mastery run earned you the golden whisper.'
        },
        {
          value: 4,
          label: 'Rainbow Myth',
          lockedLabel: 'Mystery Relic',
          image: '../images/hidden/rare.png',
          hint: 'Complete a rescue plan and share a reflection.',
          description: 'A rare badge gifted for balancing grit with reflection.'
        }
      ]
    }
  ];

  window.kiraBadgeCollections = badgeCollections;
})();
