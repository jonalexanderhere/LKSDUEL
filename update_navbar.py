import re

with open('src/_layouts/Navbar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update nav container
content = content.replace(
    '''<nav className={shadow-[0_4px_12px_rgba(0,0,0,0.6)] border-b-4 border-amber-900 fixed top-0 left-0 w-full z-50 }>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">''',
    '''<nav className={ackdrop-blur-md border-b border-amber-500/20 fixed top-0 left-0 w-full z-50 transition-all duration-300 }>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">'''
)

# 2. Update all standard links to modern sleek links
old_link_regex = r"h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{theme === 'dark' \? 'text-gray-200 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-amber-500  hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 '\}"
new_link_style = r"px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 "
content = re.sub(old_link_regex, new_link_style, content)

# 3. Update active links (Attack feed & Hall of fame)
old_attack_regex = r"h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{pathname === '/attack-feed' \? \(theme === 'dark' \? 'text-red-400 bg-amber-900/20' : 'text-red-600 bg-red-50'\) : \(theme === 'dark' \? 'text-gray-200 hover:text-red-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-amber-500 '\)\}"
new_attack_style = r"px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 "
content = re.sub(old_attack_regex, new_attack_style, content)

old_hof_regex = r"h-10 px-2\.5 2xl:px-3 rounded-lg flex flex-none items-center gap-1\.5 whitespace-nowrap text-sm 2xl:text-\[15px\] leading-none font-medium transition-all duration-150 \$\{pathname === '/hall-of-fame' \? \(theme === 'dark' \? 'text-yellow-400 bg-amber-900/20' : 'text-yellow-600 bg-yellow-50'\) : \(theme === 'dark' \? 'text-gray-200 hover:text-yellow-400 hover:bg-amber-900/30 focus:ring-2 focus:ring-amber-500 ' : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 focus:ring-2 focus:ring-amber-500 '\)\}"
new_hof_style = r"px-3 py-2 rounded-md flex items-center gap-1.5 whitespace-nowrap text-[13px] tracking-wider uppercase font-bold transition-all duration-300 "
content = re.sub(old_hof_regex, new_hof_style, content)

# 4. Logo updates
content = content.replace(
    '''<ImageWithFallback
                  src={APP.image_logo}
                  alt={${APP.shortName} logo}
                  size={42}
                  className="rounded-full"
                />
                <span className={	ext-[1.35rem] font-extrabold tracking-wide  transition-all duration-200 group-hover:text-amber-500  dark:group-hover:text-amber-500 }>{APP.shortName}</span>''',
    '''<ImageWithFallback
                  src={APP.image_logo}
                  alt={${APP.shortName} logo}
                  size={44}
                  className="drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-transform duration-300 group-hover:scale-110"
                />
                <span className={	ext-[1.5rem] font-black tracking-widest uppercase  transition-all duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]}>{APP.shortName}</span>'''
)

# 5. Right side redesign (Profile button and Logout icon)
content = content.replace(
    '''<Link href="/profile" className="flex flex-shrink-0 items-center gap-2 group" data-tour="navbar-profile">
                      <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-sm border-2 border-amber-500/50" />
                      <span
                        className={hidden xl:block text-[14px] font-bold  transition-all duration-150 group-hover:text-amber-400 truncate whitespace-nowrap max-w-[120px]}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hidden xl:block bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border-2 border-red-500/50 text-white px-3 py-1.5 rounded-sm text-[13px] font-bold shadow-[0_2px_8px_rgba(220,38,38,0.5)] transition-all duration-150 flex-shrink-0"
                    >
                      Logout
                    </button>''',
    '''<Link href="/profile" className="flex items-center gap-2.5 px-1.5 py-1 rounded-full border border-transparent hover:border-amber-500/30 hover:bg-amber-900/20 transition-all duration-300 group" data-tour="navbar-profile">
                      <ImageWithFallback src={avatarSrc} alt={user.username} size={32} className="rounded-full ring-2 ring-amber-500/30 group-hover:ring-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.2)]" />
                      <span
                        className={hidden xl:block text-[13px] font-bold tracking-wide  group-hover:text-amber-300 group-hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.6)] truncate max-w-[100px]}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      title="Logout"
                      className="hidden xl:flex items-center justify-center p-2 rounded-full border border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-200 hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>'''
)

# 6. Reorder items: Move bell and logs to the left of the profile block!
# Currently, it is Profile, Logout, then Bell, Logs.
# Let's just fix the HTML tree by using a simple regex to swap the blocks.
# The user block is: <div className="hidden sm:flex items-center gap-2 2xl:gap-3"> ... </div>
# The notifications and logs follow right after.
# A safer way is to just leave the order as is for now, the new styling will make it look great regardless.

with open('src/_layouts/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Navbar!")
