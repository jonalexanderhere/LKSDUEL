const fs = require('fs');
let content = fs.readFileSync('src/_layouts/Navbar.tsx', 'utf8');

// 1. Update <nav> container
content = content.replace(
  /<nav className=\{`shadow-\[0_4px_12px_rgba\(0,0,0,0\.6\)\] border-b-4 border-amber-900 fixed top-0 left-0 w-full z-50 \$\{theme === 'dark' \? 'bg-\[#1a0f0a\]' : 'bg-\[#3e2723\]'\}`\}>/g,
  '<nav className={`backdrop-blur-md border-b border-amber-500/20 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${theme === \\'dark\\' ? \\'bg-[#0b0604]/80 shadow-[0_8px_32px_rgba(0,0,0,0.8)]\\' : \\'bg-[#3e2723]/90 shadow-lg\\'}`>}'
);

content = content.replace(
  /<div className="w-full px-4 sm:px-6 lg:px-8">/g,
  '<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">'
);

content = content.replace(
  /<div className="flex h-14 items-center justify-between gap-4">/g,
  '<div className="flex h-16 items-center justify-between gap-6">'
);

// 2. Update Link classes to be sleeker
const newLinkClass = 'px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 ${theme === \\'dark\\' ? \\'text-amber-100/70 hover:text-amber-400 hover:bg-amber-500/10 hover:shadow-[inset_0_-2px_0_rgba(251,191,36,0.8)]\\' : \\'text-amber-900/70 hover:text-amber-700 hover:bg-amber-900/5 hover:shadow-[inset_0_-2px_0_rgba(180,83,9,0.8)]\\'}';

content = content.replace(
  /h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{theme === 'dark' \? 'text-gray-200 hover:text-amber-500\s*hover:bg-amber-900\/30 focus:ring-2 focus:ring-amber-500\s*' : 'text-gray-700 hover:text-amber-500\s*hover:bg-amber-900\/30 focus:ring-2 focus:ring-amber-500\s*'}/g,
  newLinkClass
);

// 3. Fix active link classes
content = content.replace(
  /h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{pathname === '\/attack-feed' \? \(theme === 'dark' \? 'text-red-400 bg-amber-900\/20' : 'text-red-600 bg-red-50'\) : \(theme === 'dark' \? 'text-gray-200 hover:text-red-400 hover:bg-amber-900\/30 focus:ring-2 focus:ring-amber-500\s*' : 'text-gray-700 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-amber-500\s*'\)\}/g,
  'px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 ${pathname === \\'/attack-feed\\' ? (theme === \\'dark\\' ? \\'text-red-400 bg-red-950/40 shadow-[inset_0_-2px_0_rgba(248,113,113,0.8)]\\' : \\'text-red-600 bg-red-50 shadow-[inset_0_-2px_0_rgba(220,38,38,0.8)]\\') : (theme === \\'dark\\' ? \\'text-red-400/70 hover:text-red-400 hover:bg-red-950/20 hover:shadow-[inset_0_-2px_0_rgba(248,113,113,0.5)]\\' : \\'text-red-600/70 hover:text-red-600 hover:bg-red-50/50 hover:shadow-[inset_0_-2px_0_rgba(220,38,38,0.5)]\\')}'
);

content = content.replace(
  /h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{pathname === '\/hall-of-fame' \? \(theme === 'dark' \? 'text-yellow-400 bg-amber-900\/20' : 'text-yellow-600 bg-yellow-50'\) : \(theme === 'dark' \? 'text-gray-200 hover:text-yellow-400 hover:bg-amber-900\/30 focus:ring-2 focus:ring-amber-500\s*' : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 focus:ring-2 focus:ring-amber-500\s*'\)\}/g,
  'px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 ${pathname === \\'/hall-of-fame\\' ? (theme === \\'dark\\' ? \\'text-amber-400 bg-amber-950/40 shadow-[inset_0_-2px_0_rgba(251,191,36,0.8)]\\' : \\'text-amber-600 bg-amber-50 shadow-[inset_0_-2px_0_rgba(217,119,6,0.8)]\\') : (theme === \\'dark\\' ? \\'text-amber-400/70 hover:text-amber-400 hover:bg-amber-950/20 hover:shadow-[inset_0_-2px_0_rgba(251,191,36,0.5)]\\' : \\'text-amber-600/70 hover:text-amber-600 hover:bg-amber-50/50 hover:shadow-[inset_0_-2px_0_rgba(217,119,6,0.5)]\\')}'
);

// 4. Logo updates
content = content.replace(
  /<span className=\{`text-\[1\.35rem\] font-extrabold tracking-wide \$\{theme === 'dark' \? 'text-white' : 'text-amber-100'\} transition-all duration-200 group-hover:text-amber-500\s*dark:group-hover:text-amber-500\s*`\}>/g,
  '<span className={`text-[1.5rem] font-black tracking-widest uppercase ${theme === \\'dark\\' ? \\'text-amber-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]\\' : \\'text-amber-900\\'} transition-all duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]`}>'
);

content = content.replace(
  /size=\{42\}\r?\n\s*className="rounded-full"/g,
  'size={44}\n                  className="drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-transform duration-300 group-hover:scale-110"'
);

// 5. Right side redesign (Profile button and Logout icon)
content = content.replace(
  /<Link href="\/profile" className="flex flex-shrink-0 items-center gap-2 group" data-tour="navbar-profile">\s*<ImageWithFallback src=\{avatarSrc\} alt=\{user\.username\} size=\{36\} className="rounded-sm border-2 border-amber-500\/50" \/>\s*<span\s*className=\{`hidden xl:block text-\[14px\] font-bold \$\{theme === 'dark' \? 'text-amber-100' : 'text-amber-900'\} transition-all duration-150 group-hover:text-amber-400 truncate whitespace-nowrap max-w-\[120px\]`\}\s*title=\{user\.username\}\s*>\s*\{user\.username\}\s*<\/span>\s*<\/Link>/g,
  `<Link href="/profile" className="flex items-center gap-2.5 px-1.5 py-1 rounded-full border border-transparent hover:border-amber-500/30 hover:bg-amber-900/20 transition-all duration-300 group" data-tour="navbar-profile">
                      <ImageWithFallback src={avatarSrc} alt={user.username} size={32} className="rounded-full ring-2 ring-amber-500/30 group-hover:ring-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.2)]" />
                      <span
                        className={\`hidden xl:block text-[13px] font-bold tracking-wide \${theme === 'dark' ? 'text-amber-50' : 'text-amber-900'} group-hover:text-amber-300 group-hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.6)] truncate max-w-[100px]\`}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                    </Link>`
);

content = content.replace(
  /<button\s*onClick=\{handleLogout\}\s*className="hidden xl:block bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-red-500\/50 text-white px-3 py-1\.5 rounded-sm text-\[13px\] font-bold shadow-\[0_2px_8px_rgba\(220,38,38,0\.5\)\] transition-all duration-150 flex-shrink-0"\s*>\s*Logout\s*<\/button>/g,
  `<button
                      onClick={handleLogout}
                      title="Logout"
                      className="hidden xl:flex items-center justify-center p-2 rounded-full border border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-200 hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>`
);

// We need to reorder elements! Let's just fix it manually after.
fs.writeFileSync('src/_layouts/Navbar.tsx', content);
console.log('Navbar updated styling!');
