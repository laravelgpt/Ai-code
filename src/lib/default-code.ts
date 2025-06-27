export const defaultJSCode = `// Welcome to the AI Code Workbench!
// Select code and use the AI tools above.
// Or just write code and run it.

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  // Try fixing this typo: console.lg("This is a test.");
  return \`Greetings, \${name}\`;
}

const message = greet('Developer');
console.log(message);
`;

export const defaultPythonCode = `# Welcome to the AI Code Workbench!
# Select code and use the AI tools above.
# Or just write code and run it.

def greet(name):
  print(f"Hello, {name}!")
  # AI execution for Python is not supported in this demo.
  # But you can still use the AI tools!
  return f"Greetings, {name}"

message = greet('Developer')
print(message)
`;
