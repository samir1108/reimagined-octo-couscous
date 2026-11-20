function pascalToKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

console.log('The30SecondMind ->', pascalToKebab('The30SecondMind'));
console.log('StopTheSpinning ->', pascalToKebab('StopTheSpinning'));
console.log('Japa108 ->', pascalToKebab('Japa108'));