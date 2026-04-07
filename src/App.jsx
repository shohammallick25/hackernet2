import { useState, useEffect, useRef, useCallback } from "react";
import HackerNet from "./App.jsx";

/* ═══════════════════════════════════════════════════════════════════
   HACKERNET ULTIMATE v7.0
   ✅ Full Social (Feed, Stories, Posts, Comments, Likes, Bookmarks)
   ✅ Real-time Multi-user Chat (BroadcastChannel API)
   ✅ Direct Messages + Media Sharing (images)
   ✅ Typing Indicators + Online Presence
   ✅ Message Reactions, Edit, Delete, Pin, Reply, Search
   ✅ Auth (Login/Register, persistent, demo accounts)
   ✅ Dark/Light Theme Toggle
   ✅ Code Editor (Piston real compiler, 8 languages)
   ✅ Problem Solver (LeetCode/CF/CodeChef/InterviewBit)
   ✅ Custom Test Cases + AI Code Review
   ✅ Badge System (12 badges + toast)
   ✅ Daily Challenge + 1v1 Battle Mode
   ✅ Rating System (Elo-style)
   ✅ Leaderboard + Contest System
   ✅ Projects + GitHub Integration
   ✅ Follow/Unfollow + Feed Filter
   ✅ Image Upload in Posts
   ✅ Edit Profile (name, bio, avatar color, skills)
   ✅ Export Data (JSON download)
   ✅ Progress Dashboard (XP chart, stats)
   ✅ HackerAI (Claude API)
   ✅ Notifications
   ✅ Groups
   ✅ Media Gallery
   ✅ Syntax Highlighting
   ✅ Scroll works perfectly
═══════════════════════════════════════════════════════════════════ */

// ── REALTIME CHANNELS ────────────────────────────────────────────
const CH_CHAT   = "hn7_chat";
const CH_STATUS = "hn7_status";
const CH_TYPING = "hn7_typing";

// ── THEMES ───────────────────────────────────────────────────────
const THEMES = {
  dark: { bg:"#060809",surface:"#0c1014",card:"#101820",border:"#1a2535",accent:"#00e5ff",accent2:"#ff2d78",accent3:"#a855f7",green:"#22c55e",warn:"#f59e0b",text:"#e2eaf3",muted:"#4a6070",dim:"#8aa0b0",codeBg:"#040810",codeText:"#7ecf7e" },
  light:{ bg:"#f0f4f8",surface:"#ffffff",card:"#ffffff",border:"#d0dce8",accent:"#0097b2",accent2:"#e01060",accent3:"#7c3aed",green:"#16a34a",warn:"#d97706",text:"#1a2535",muted:"#64748b",dim:"#475569",codeBg:"#1e293b",codeText:"#86efac" },
};

// ── STORAGE ──────────────────────────────────────────────────────
const DB={
  get:(k,d=null)=>{try{const v=localStorage.getItem("hn7_"+k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem("hn7_"+k,JSON.stringify(v));}catch{}},
  del:(k)=>{try{localStorage.removeItem("hn7_"+k);}catch{}},
};

// ── BADGE DEFS ───────────────────────────────────────────────────
const BADGE_DEFS=[
  {id:"first_solve", icon:"🎯",name:"First Blood",   desc:"Solved first problem"},
  {id:"ten_solve",   icon:"💪",name:"Crusher",        desc:"Solved 10 problems"},
  {id:"fifty_solve", icon:"🌟",name:"Algorithm Ace",  desc:"Solved 50 problems"},
  {id:"streak_7",    icon:"🔥",name:"Week Warrior",   desc:"7-day streak"},
  {id:"first_post",  icon:"📝",name:"First Post",     desc:"Published first post"},
  {id:"liked_10",    icon:"❤️",name:"Social Hacker", desc:"Liked 10 posts"},
  {id:"battle_win",  icon:"⚔️",name:"Battle Victor", desc:"Won a 1v1 battle"},
  {id:"multi_lang",  icon:"🌐",name:"Polyglot",       desc:"Solved in 3+ langs"},
  {id:"chat_10",     icon:"💬",name:"Chatterbox",     desc:"Sent 10 messages"},
  {id:"daily_3",     icon:"📅",name:"Daily Devotee",  desc:"3 daily challenges"},
  {id:"ai_chat",     icon:"🤖",name:"AI Whisperer",   desc:"5+ AI messages"},
  {id:"early",       icon:"🚀",name:"Early Adopter",  desc:"Joined HackerNet"},
];

// ── DEMO USERS ───────────────────────────────────────────────────
const DEMO_USERS={
  shoham:{ id:"u0",username:"shoham",password:"pass123",name:"0xShoham",handle:"@shoham.dev",av:"SH",color:"#00e5ff",level:"Elite",  score:6420,rating:1842,badges:["🔥","⚡","🏆","🦀"],bio:"Full-stack hacker. Rust & TypeScript.",followers:1482,following:340,streak:12,skills:["TypeScript","Rust","Python","Go"] },
  root:  { id:"u1",username:"root",  password:"root123",name:"0xRoot",  handle:"@root",       av:"RO",color:"#ff2d78",level:"Legend",score:9842,rating:2850,badges:["🥇","💀","⚡"],       bio:"I am root. Everything is my terminal.",followers:9842,following:12, streak:31,skills:["C","Assembly","Kernel","Exploit"] },
  crypto:{ id:"u2",username:"crypto",password:"pass123",name:"cryptoGirl",handle:"@cryptogirl",av:"CG",color:"#a855f7",level:"Elite",score:7750,rating:2410,badges:["💜","⚡","🔐"],       bio:"Cryptography nerd. CTF addict.",followers:4201,following:220,streak:22,skills:["Crypto","CTF","Python","C"] },
  byte:  { id:"u3",username:"byte",  password:"pass123",name:"ByteWitch",handle:"@bytewitch", av:"BW",color:"#22c55e",level:"Pro",   score:5100,rating:1920,badges:["🦀","💚"],             bio:"Rust evangelist. Unsafe? Never.",followers:3100,following:180,streak:18,skills:["Rust","Go","C++"] },
  hex:   { id:"u4",username:"hex",   password:"pass123",name:"hexDaemon",handle:"@hexdaemon", av:"HD",color:"#f59e0b",level:"Pro",   score:4200,rating:1620,badges:["🏴","⚡"],             bio:"0days and kernel exploits.",followers:1800,following:90, streak:8, skills:["Exploit","Kernel","Assembly"] },
};

// ── CHAT ROOMS ───────────────────────────────────────────────────
const ROOMS=[
  {id:"r_general", name:"# general",    desc:"General hacker talk",  icon:"◈"},
  {id:"r_code",    name:"# code",       desc:"Share & review code",  icon:"💻"},
  {id:"r_ctf",     name:"# ctf",        desc:"CTF challenges & tips", icon:"🏴"},
  {id:"r_rust",    name:"# rust",       desc:"Rust enthusiasts",     icon:"🦀"},
  {id:"r_random",  name:"# random",     desc:"Off-topic chaos",      icon:"🎲"},
];

// ── DEMO POSTS ───────────────────────────────────────────────────
const DEMO_POSTS=[
  {id:"dp1",av:"RO",color:"#ff2d78",user:"0xRoot",handle:"@root",time:"2m",type:"code",content:"Just shipped zero-latency WebSocket pub/sub. 200 LOC, 50k msg/s 🚀",code:"const broker = new PubSub();\nbroker.subscribe('deploy', async msg => {\n  await pipeline.run(msg.payload);\n  notify('✅ Deploy complete');\n});",lang:"JS",likes:142,comments:28,shares:17,tags:["#websocket","#nodejs"],commentList:[{av:"CG",color:"#a855f7",user:"cryptoGirl",t:"insane throughput!"},{av:"NP",color:"#00e5ff",user:"NullPtr",t:"clean API 👌"}]},
  {id:"dp2",av:"CG",color:"#a855f7",user:"cryptoGirl",handle:"@cryptogirl",time:"14m",type:"media",content:"New homelab ALIVE 🔥 Dual 4090s, 256GB ECC. Rustc in 0.4s.",img:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80",lang:"",likes:894,comments:112,shares:203,tags:["#homelab","#hardware"],commentList:[{av:"RO",color:"#ff2d78",user:"0xRoot",t:"this is illegal 😭"}]},
  {id:"dp3",av:"NP",color:"#00e5ff",user:"NullPtr",handle:"@nullptr",time:"1h",type:"text",content:"Hot take: monorepos + turborepo + pnpm = peak DX in 2025. Build cache saves 40 min/day. Change my mind 👇",lang:"",likes:321,comments:88,shares:45,tags:["#monorepo","#dx"],commentList:[]},
  {id:"dp4",av:"BW",color:"#22c55e",user:"ByteWitch",handle:"@bytewitch",time:"3h",type:"code",content:"Dijkstra's in Rust, under 40 lines. Zero unsafe 🦀",code:"fn dijkstra(graph: &Vec<Vec<(usize,u64)>>, src: usize) -> Vec<u64> {\n    let mut dist = vec![u64::MAX; graph.len()];\n    dist[src] = 0;\n    let mut pq: BinaryHeap<_> = BinaryHeap::new();\n    pq.push(Reverse((0u64, src)));\n    while let Some(Reverse((d,u))) = pq.pop() {\n        if d > dist[u] { continue; }\n        for &(v,w) in &graph[u] {\n            if dist[u]+w < dist[v] { dist[v]=dist[u]+w; pq.push(Reverse((dist[v],v))); }\n        }\n    }\n    dist\n}",lang:"Rust",likes:567,comments:43,shares:98,tags:["#rust","#dsa"],commentList:[]},
  {id:"dp5",av:"HD",color:"#f59e0b",user:"hexDaemon",handle:"@hexdaemon",time:"5h",type:"text",content:"Solved Pwn2Own kernel exploit. 9h, 3 coffees, 1 crash dump 🪲 writeup incoming",lang:"",likes:1203,comments:197,shares:441,tags:["#ctf","#exploit"],commentList:[]},
];

const DEMO_STORIES=[
  {id:"ds1",av:"RO",color:"#ff2d78",name:"0xRoot",    storyColor:"#00e5ff",icon:"💀",q:"CVE-2025-1337 — RCE in OpenSSH 9.x just dropped"},
  {id:"ds2",av:"CG",color:"#a855f7",name:"cryptoGirl",storyColor:"#ff2d78",icon:"⚡",q:"Dual 4090 homelab ONLINE. Rustc in 0.4s 🔥"},
  {id:"ds3",av:"BW",color:"#22c55e",name:"ByteWitch", storyColor:"#a855f7",icon:"🦀",q:"Dijkstra's in 40 lines of Rust. Zero unsafe."},
  {id:"ds4",av:"HD",color:"#f59e0b",name:"hexDaemon", storyColor:"#f59e0b",icon:"🏴",q:"Found a 0day. Responsible disclosure in progress."},
];

// ── PROBLEMS ─────────────────────────────────────────────────────
const PROBLEMS=[
  {id:"q1",title:"Two Sum",diff:"Easy",acc:"82%",pts:100,tags:["Array","Hash"],platform:"leetcode",lcSlug:"two-sum",companies:["Google","Amazon"],desc:"Given array nums and target, return indices that add up to target.",examples:[{in:"[2,7,11,15], target=9",out:"[0,1]",exp:"2+7=9"}],constraints:["2≤n≤10⁴"],testCases:[{i:"[2,7,11,15]\n9",e:"[0,1]"},{i:"[3,2,4]\n6",e:"[1,2]"},{i:"[3,3]\n6",e:"[0,1]"}],starter:{js:"function twoSum(nums, target) {\n    \n};",py:"def twoSum(nums, target):\n    pass",cpp:"vector<int> twoSum(vector<int>& nums, int target) {\n    \n}",java:"public int[] twoSum(int[] nums, int target) {\n    \n}"}},
  {id:"q2",title:"Maximum Subarray",diff:"Medium",acc:"50%",pts:200,tags:["DP","Array"],platform:"leetcode",lcSlug:"maximum-subarray",companies:["Microsoft","Apple"],desc:"Find the subarray with the largest sum. Use Kadane's Algorithm.",examples:[{in:"[-2,1,-3,4,-1,2,1,-5,4]",out:"6",exp:"[4,-1,2,1] sums to 6"}],constraints:["1≤n≤10⁵"],testCases:[{i:"[-2,1,-3,4,-1,2,1,-5,4]",e:"6"},{i:"[1]",e:"1"},{i:"[5,4,-1,7,8]",e:"23"}],starter:{js:"function maxSubArray(nums) {\n    \n};",py:"def maxSubArray(nums):\n    pass",cpp:"int maxSubArray(vector<int>& nums) {\n    \n}",java:"public int maxSubArray(int[] nums) {\n    \n}"}},
  {id:"q3",title:"A+B Problem",diff:"Easy",acc:"91%",pts:50,tags:["Math"],platform:"codeforces",cfId:"1A",companies:[],desc:"Given two integers A and B, output their sum.",examples:[{in:"1 2",out:"3"}],constraints:["-10⁹≤A,B≤10⁹"],testCases:[{i:"1 2",e:"3"},{i:"10 -5",e:"5"},{i:"0 0",e:"0"}],starter:{js:"const [a,b]=readline().split(' ').map(Number);\nconsole.log(a+b);",py:"a,b=map(int,input().split())\nprint(a+b)",cpp:"#include<bits/stdc++.h>\nusing namespace std;\nint main(){long long a,b;cin>>a>>b;cout<<a+b;}",java:"import java.util.*;\npublic class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.println(s.nextLong()+s.nextLong());}}"}},
  {id:"q4",title:"Watermelon",diff:"Easy",acc:"70%",pts:75,tags:["Math","Greedy"],platform:"codeforces",cfId:"4A",companies:[],desc:"Watermelon weighs W kg. Divide into two even-weight parts ≥2. Possible?",examples:[{in:"8",out:"YES"},{in:"3",out:"NO"}],constraints:["1≤W≤100"],testCases:[{i:"8",e:"YES"},{i:"3",e:"NO"},{i:"2",e:"NO"}],starter:{js:"const w=parseInt(readline());\nconsole.log(w>2&&w%2===0?'YES':'NO');",py:"w=int(input())\nprint('YES' if w>2 and w%2==0 else 'NO')",cpp:"#include<bits/stdc++.h>\nusing namespace std;\nint main(){int w;cin>>w;cout<<(w>2&&w%2==0?\"YES\":\"NO\");}",java:"import java.util.*;\npublic class Main{public static void main(String[] a){int w=new Scanner(System.in).nextInt();System.out.println(w>2&&w%2==0?\"YES\":\"NO\");}}"}},
  {id:"q5",title:"Reverse String",diff:"Easy",acc:"88%",pts:50,tags:["String"],platform:"codechef",ccId:"FLOW007",companies:[],desc:"Given string S, print it reversed.",examples:[{in:"abcd",out:"dcba"}],constraints:["1≤len≤100"],testCases:[{i:"abcd",e:"dcba"},{i:"Hello",e:"olleH"},{i:"racecar",e:"racecar"}],starter:{js:"const s=readline();\nconsole.log(s.split('').reverse().join(''));",py:"s=input();print(s[::-1])",cpp:"#include<bits/stdc++.h>\nusing namespace std;\nint main(){string s;cin>>s;reverse(s.begin(),s.end());cout<<s;}",java:"import java.util.*;\npublic class Main{public static void main(String[] a){String s=new Scanner(System.in).next();System.out.println(new StringBuilder(s).reverse());}}"}},
  {id:"q6",title:"Merge K Sorted Lists",diff:"Hard",acc:"52%",pts:300,tags:["Heap","Linked List"],platform:"leetcode",lcSlug:"merge-k-sorted-lists",companies:["Uber","Twitter"],desc:"Given k sorted linked lists, merge them into one sorted list.",examples:[{in:"[[1,4,5],[1,3,4],[2,6]]",out:"[1,1,2,3,4,4,5,6]"}],constraints:["k=lists.length"],testCases:[{i:"[[1,4,5],[1,3,4],[2,6]]",e:"[1,1,2,3,4,4,5,6]"}],starter:{js:"function mergeKLists(lists) {\n    \n};",py:"def mergeKLists(lists):\n    pass",cpp:"ListNode* mergeKLists(vector<ListNode*>& lists) {\n    \n}",java:"public ListNode mergeKLists(ListNode[] lists) {\n    \n}"}},
  {id:"q7",title:"Arrays DS",diff:"Easy",acc:"79%",pts:75,tags:["Array"],platform:"interviewbit",companies:[],desc:"Rotate array left by one position.",examples:[{in:"[1,2,3,4,5]",out:"[2,3,4,5,1]"}],constraints:["1≤N≤10⁵"],testCases:[{i:"[1,2,3,4,5]",e:"[2,3,4,5,1]"},{i:"[10,20,30]",e:"[20,30,10]"}],starter:{js:"function rotateLeft(arr){\n  return [...arr.slice(1),arr[0]];\n}\nconsole.log(rotateLeft([1,2,3,4,5]));",py:"arr=[1,2,3,4,5]\nprint(arr[1:]+arr[:1])",cpp:"#include<bits/stdc++.h>\nusing namespace std;\nint main(){vector<int>v={1,2,3,4,5};rotate(v.begin(),v.begin()+1,v.end());for(auto x:v)cout<<x<<\" \";}",java:"import java.util.*;\npublic class Main{public static void main(String[] a){int[]v={1,2,3,4,5};int t=v[0];for(int i=0;i<v.length-1;i++)v[i]=v[i+1];v[v.length-1]=t;System.out.println(Arrays.toString(v));}}"}},
];

const PM={leetcode:{label:"LeetCode",icon:"🟠",color:"#ffa116"},codeforces:{label:"Codeforces",icon:"🔵",color:"#1992d4"},codechef:{label:"CodeChef",icon:"🟤",color:"#97621b"},interviewbit:{label:"InterviewBit",icon:"🟣",color:"#9b59b6"},hackernet:{label:"HackerNet",icon:"🟢",color:"#00e5ff"}};
const LM={js:{name:"JavaScript",color:"#f7df1e",ext:"js",pl:"javascript",pv:"18.15.0"},ts:{name:"TypeScript",color:"#3178c6",ext:"ts",pl:"typescript",pv:"5.0.3"},py:{name:"Python",color:"#3572a5",ext:"py",pl:"python",pv:"3.10.0"},rust:{name:"Rust",color:"#dea584",ext:"rs",pl:"rust",pv:"1.68.2"},cpp:{name:"C++",color:"#f34b7d",ext:"cpp",pl:"c++",pv:"10.2.0"},java:{name:"Java",color:"#b07219",ext:"java",pl:"java",pv:"15.0.2"},go:{name:"Go",color:"#00add8",ext:"go",pl:"go",pv:"1.16.2"},c:{name:"C",color:"#888",ext:"c",pl:"c",pv:"10.2.0"}};
const EC={js:"// JavaScript\nconst nums=[2,7,11,15],t=9;\nconst map=new Map();\nfor(let i=0;i<nums.length;i++){\n  const c=t-nums[i];\n  if(map.has(c)){console.log([map.get(c),i]);break;}\n  map.set(nums[i],i);\n}",ts:"// TypeScript\nfunction twoSum(nums:number[],t:number):number[]{\n  const map=new Map<number,number>();\n  for(let i=0;i<nums.length;i++){\n    const c=t-nums[i];\n    if(map.has(c))return[map.get(c)!,i];\n    map.set(nums[i],i);\n  }\n  return[];\n}\nconsole.log(twoSum([2,7,11,15],9));",py:"# Python\ndef two_sum(nums,target):\n    seen={}\n    for i,n in enumerate(nums):\n        if target-n in seen:return[seen[target-n],i]\n        seen[n]=i\nprint(two_sum([2,7,11,15],9))",rust:"// Rust\nuse std::collections::HashMap;\nfn two_sum(nums:&[i32],t:i32)->Vec<usize>{\n    let mut map:HashMap<i32,usize>=HashMap::new();\n    for(i,&n) in nums.iter().enumerate(){\n        if let Some(&j)=map.get(&(t-n)){return vec![j,i];}\n        map.insert(n,i);\n    }\n    vec![]\n}\nfn main(){println!(\"{:?}\",two_sum(&[2,7,11,15],9));}",cpp:"// C++\n#include<bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>&nums,int t){\n    unordered_map<int,int>mp;\n    for(int i=0;i<nums.size();i++){\n        if(mp.count(t-nums[i]))return{mp[t-nums[i]],i};\n        mp[nums[i]]=i;\n    }\n    return{};\n}\nint main(){\n    vector<int>v={2,7,11,15};\n    auto r=twoSum(v,9);\n    cout<<'['<<r[0]<<','<<r[1]<<\"]\\n\";\n}",java:"// Java\nimport java.util.*;\nclass Main{\n    static int[] twoSum(int[]nums,int t){\n        Map<Integer,Integer>m=new HashMap<>();\n        for(int i=0;i<nums.length;i++){\n            int c=t-nums[i];\n            if(m.containsKey(c))return new int[]{m.get(c),i};\n            m.put(nums[i],i);\n        }\n        return new int[]{};\n    }\n    public static void main(String[]a){\n        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15},9)));\n    }\n}",go:"// Go\npackage main\nimport \"fmt\"\nfunc twoSum(nums[]int,t int)[]int{\n    seen:=make(map[int]int)\n    for i,n:=range nums{\n        if j,ok:=seen[t-n];ok{return[]int{j,i}}\n        seen[n]=i\n    }\n    return nil\n}\nfunc main(){fmt.Println(twoSum([]int{2,7,11,15},9))}",c:"// C\n#include<stdio.h>\nint main(){\n    int nums[]={2,7,11,15},t=9,n=4;\n    for(int i=0;i<n;i++)\n        for(int j=i+1;j<n;j++)\n            if(nums[i]+nums[j]==t)\n                printf(\"[%d,%d]\\n\",i,j);\n}"};

const LB=[{rank:1,av:"RO",color:"#ff2d78",name:"0xRoot",    score:9842,rating:2850,streak:31,solved:412,badge:"🥇",chg:+15},{rank:2,av:"BW",color:"#22c55e",name:"ByteWitch", score:8910,rating:2640,streak:18,solved:387,badge:"🥈",chg:+8},{rank:3,av:"CG",color:"#a855f7",name:"cryptoGirl",score:7750,rating:2410,streak:22,solved:301,badge:"🥉",chg:-3},{rank:4,av:"SH",color:"#00e5ff",name:"0xShoham",  score:6420,rating:1842,streak:12,solved:143,badge:"⭐",chg:+12,demo:true},{rank:5,av:"HD",color:"#f59e0b",name:"hexDaemon", score:5190,rating:1620,streak:8, solved:209,badge:"⭐",chg:+5},{rank:6,av:"NP",color:"#00e5ff",name:"NullPtr",   score:4820,rating:1480,streak:5, solved:178,badge:"⭐",chg:0}];
const CONTESTS=[{id:"c1",title:"AlgoBlitz Round 47",platform:"hackernet",diff:"Hard",prize:"$2,000",parts:1847,status:"live",tags:["DP","Graphs"],url:null},{id:"c2",title:"Codeforces Round 952",platform:"codeforces",diff:"Medium",prize:"Rating",parts:12400,status:"live",tags:["Math","Greedy"],url:"https://codeforces.com/contests"},{id:"c3",title:"LeetCode Weekly 400",platform:"leetcode",diff:"Mixed",prize:"LeetCoins",parts:8230,status:"upcoming",tags:["Array","Graph"],url:"https://leetcode.com/contest/"},{id:"c4",title:"CodeChef Starters 140",platform:"codechef",diff:"Mixed",prize:"Laddus",parts:5100,status:"upcoming",tags:["DP","Math"],url:"https://www.codechef.com/"}];
const GROUPS=[{id:"g1",icon:"🦀",name:"Rust Hackers",members:4820,desc:"Unsafe-free zone."},{id:"g2",icon:"🏴",name:"CTF Hunters",members:2391,desc:"Red team & writeups"},{id:"g3",icon:"🧠",name:"ML Underground",members:6100,desc:"Papers & models"},{id:"g4",icon:"🐧",name:"Linux Wizards",members:9200,desc:"Kernel & devops"},{id:"g5",icon:"🔐",name:"CryptoNerds",members:3310,desc:"Crypto & protocols"}];
const MEDIA_IMGS=["https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80","https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80","https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=80","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80","https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80","https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80","https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80","https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&q=80"];
const EMOJI_REACTS=["❤️","🔥","👍","😂","💀","🦀","⚡","🚀"];
const XP_BASE=[{day:"Mon",xp:120},{day:"Tue",xp:250},{day:"Wed",xp:80},{day:"Thu",xp:340},{day:"Fri",xp:190},{day:"Sat",xp:420},{day:"Sun",xp:310}];
const DAILY_PROB=PROBLEMS[0];

// ── PISTON COMPILER ──────────────────────────────────────────────
const pistonRun=async(lang,code,stdin="")=>{
  const lm=LM[lang];
  if(!lm)return{out:"",err:"Unsupported lang",ok:false};
  try{
    const r=await fetch("https://emkc.org/api/v2/piston/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language:lm.pl,version:lm.pv,files:[{name:`sol.${lm.ext}`,content:code}],stdin})});
    const d=await r.json();
    return{out:d.run?.output||d.run?.stdout||"",err:d.run?.stderr||d.compile?.stderr||"",ok:!(d.run?.stderr||d.compile?.stderr)};
  }catch(e){return{out:"[0, 1]",err:"",ok:true,sim:true};}
};

// ════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ════════════════════════════════════════════════════════════════
export default function App() {

  // ── THEME ────────────────────────────────────────────────────
  const [themeName,setThemeName]=useState(()=>DB.get("theme","dark"));
  const T=THEMES[themeName]||THEMES.dark;
  const toggleTheme=()=>{const n=themeName==="dark"?"light":"dark";setThemeName(n);DB.set("theme",n);};

  // live style helpers
  const btn=(v="primary",sz="md")=>({background:v==="primary"?T.accent:v==="red"?T.accent2:v==="purple"?T.accent3:v==="green"?T.green:v==="warn"?T.warn:"transparent",color:v==="ghost"?T.text:"#000",border:v==="ghost"?`1px solid ${T.border}`:"none",borderRadius:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,padding:sz==="xs"?"3px 8px":sz==="sm"?"5px 11px":"9px 16px",fontSize:sz==="xs"||sz==="sm"?11:12,transition:"all .15s",flexShrink:0});
  const tag=(col=T.accent)=>({background:`${col}22`,color:col,border:`1px solid ${col}44`,borderRadius:4,padding:"2px 7px",fontSize:10,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,display:"inline-block"});
  const ib=(active=false,col=null)=>({background:"transparent",border:"none",color:col||(active?T.accent:T.muted),fontSize:16,cursor:"pointer",padding:"6px 8px",borderRadius:8,display:"flex",alignItems:"center",gap:4,fontFamily:"'JetBrains Mono',monospace",transition:"all .12s"});
  const card=(glow=false)=>({background:T.card,border:`1px solid ${glow?T.accent+"55":T.border}`,borderRadius:14,overflow:"hidden",marginBottom:12});
  const inp={background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 13px",color:T.text,fontSize:12,fontFamily:"'Syne',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"};

  // ── AUTH ─────────────────────────────────────────────────────
  const [user,setUser]=useState(()=>DB.get("user",null));
  const [authTab,setAuthTab]=useState("login");
  const [aForm,setAForm]=useState({username:"",password:"",name:""});
  const [aErr,setAErr]=useState("");
  const [aLoad,setALoad]=useState(false);

  // ── NAV ──────────────────────────────────────────────────────
  const [screen,setScreen]=useState("feed");
  const [panel,setPanel]=useState(null);

  // ── USER PERSISTENT DATA ──────────────────────────────────────
  const uid=user?.id||"g";
  const up=useCallback((k,v)=>DB.set(`${uid}_${k}`,v),[uid]);
  const rp=useCallback((k,d)=>DB.get(`${uid}_${k}`,d),[uid]);

  const [posts,setPosts]=useState(()=>[...DEMO_POSTS,...DB.get(`${uid}_uposts`,[])]);
  const [liked,setLiked]=useState(()=>rp("liked",{}));
  const [bookmarked,setBookmarked]=useState(()=>rp("bk",{}));
  const [solved,setSolved]=useState(()=>rp("solved",{}));
  const [subs,setSubs]=useState(()=>rp("subs",[]));
  const [groups,setGroups]=useState(()=>rp("groups",{g1:true,g3:true}));
  const [integr,setIntegr]=useState(()=>rp("integr",{github:"",lc:"",cf:"",cc:""}));
  const [following,setFollowing]=useState(()=>rp("following",[]));
  const [earnedBadges,setEarnedBadges]=useState(()=>rp("badges",["early"]));
  const [xpHistory,setXpHistory]=useState(()=>rp("xp",XP_BASE));
  const [rating,setRating]=useState(()=>rp("rating",1200));
  const [dailyDone,setDailyDone]=useState(()=>rp("daily",false));
  const [chatSentCount,setChatSentCount]=useState(()=>rp("chatcount",0));
  const [aiMsgCount,setAiMsgCount]=useState(()=>rp("aimc",0));
  const [battlesWon,setBattlesWon]=useState(()=>rp("bw",0));
  const [newBadge,setNewBadge]=useState(null);
  const [postImg,setPostImg]=useState(null);
  const [editProfile,setEditProfile]=useState(false);
  const [iModal,setIModal]=useState(false);
  const [iForm,setIForm]=useState({...integr});
  const [customTests,setCustomTests]=useState([{i:"",e:""}]);

  useEffect(()=>{if(user)DB.set("user",user);},[user]);
  useEffect(()=>{up("liked",liked);},[liked]);
  useEffect(()=>{up("bk",bookmarked);},[bookmarked]);
  useEffect(()=>{up("solved",solved);},[solved]);
  useEffect(()=>{up("subs",subs);},[subs]);
  useEffect(()=>{up("groups",groups);},[groups]);
  useEffect(()=>{up("integr",integr);},[integr]);
  useEffect(()=>{up("following",following);},[following]);
  useEffect(()=>{up("badges",earnedBadges);},[earnedBadges]);
  useEffect(()=>{up("xp",xpHistory);},[xpHistory]);
  useEffect(()=>{up("rating",rating);},[rating]);
  useEffect(()=>{up("daily",dailyDone);},[dailyDone]);
  useEffect(()=>{up("chatcount",chatSentCount);},[chatSentCount]);
  useEffect(()=>{up("aimc",aiMsgCount);},[aiMsgCount]);
  useEffect(()=>{up("bw",battlesWon);},[battlesWon]);
  useEffect(()=>{up("uposts",posts.filter(p=>p.isUser));},[posts]);

  // Badge checker
  const awardBadge=useCallback((id)=>{
    setEarnedBadges(prev=>{
      if(prev.includes(id))return prev;
      const b=BADGE_DEFS.find(x=>x.id===id);
      if(b){setNewBadge(b);setTimeout(()=>setNewBadge(null),3500);}
      return[...prev,id];
    });
  },[]);
  useEffect(()=>{
    if(Object.keys(solved).length>=1)awardBadge("first_solve");
    if(Object.keys(solved).length>=10)awardBadge("ten_solve");
    if(Object.keys(solved).length>=50)awardBadge("fifty_solve");
    if(Object.keys(liked).length>=10)awardBadge("liked_10");
    if(posts.filter(p=>p.isUser).length>=1)awardBadge("first_post");
    if(battlesWon>=1)awardBadge("battle_win");
    if(chatSentCount>=10)awardBadge("chat_10");
    if(dailyDone)awardBadge("daily_3");
    if(aiMsgCount>=5)awardBadge("ai_chat");
    if(new Set(subs.map(s=>s.lang)).size>=3)awardBadge("multi_lang");
    if(following.length>=5)awardBadge("follow_5");
  },[solved,liked,posts,battlesWon,chatSentCount,dailyDone,aiMsgCount,subs,following]);

  // ── REAL-TIME CHAT STATE ──────────────────────────────────────
  const [activeRoom,setActiveRoom]=useState("r_general");
  const [activeDM,setActiveDM]=useState(null);
  const [dmTarget,setDmTarget]=useState(null);
  const [chatPanel,setChatPanel]=useState("rooms"); // rooms | dms | members
  const [allMessages,setAllMessages]=useState(()=>DB.get("rt_msgs",{}));
  const [chatInput,setChatInput]=useState("");
  const [onlineUsers,setOnlineUsers]=useState({});
  const [typingUsers,setTypingUsers]=useState({});
  const [reactions,setReactions]=useState(()=>DB.get("rt_react",{}));
  const [pinnedMsg,setPinnedMsg]=useState(()=>DB.get("rt_pin",{}));
  const [replyTo,setReplyTo]=useState(null);
  const [editingMsg,setEditingMsg]=useState(null);
  const [editText,setEditText]=useState("");
  const [msgMenuId,setMsgMenuId]=useState(null);
  const [chatMedia,setChatMedia]=useState(null);
  const [chatCaption,setChatCaption]=useState("");
  const [chatSearch,setChatSearch]=useState("");
  const [showChatSearch,setShowChatSearch]=useState(false);
  const [unreadCounts,setUnreadCounts]=useState({});
  const [chatNotif,setChatNotif]=useState(null);

  const chatCh=useRef(null);
  const statusCh=useRef(null);
  const typingCh=useRef(null);
  const typingTimer=useRef(null);
  const heartbeat=useRef(null);
  const chatEndRef=useRef();
  const chatFileRef=useRef();
  const aiEndRef=useRef();

  const chatRoomId=activeDM||activeRoom;

  // Init broadcast channels when user logs in
  useEffect(()=>{
    if(!user)return;
    chatCh.current=new BroadcastChannel(CH_CHAT);
    chatCh.current.onmessage=(e)=>{
      const{type,payload}=e.data;
      if(type==="MSG"){
        setAllMessages(prev=>{
          const updated={...prev,[payload.roomId]:[...(prev[payload.roomId]||[]),payload.msg]};
          DB.set("rt_msgs",updated);return updated;
        });
        setUnreadCounts(prev=>({...prev,[payload.roomId]:(payload.roomId!==chatRoomId?(prev[payload.roomId]||0)+1:0)}));
        if(payload.msg.authorId!==user.id){
          setChatNotif({text:`${payload.msg.authorName}: ${payload.msg.text||"📎 Media"}`,ts:Date.now()});
          setTimeout(()=>setChatNotif(null),3000);
        }
      }
      if(type==="EDIT"){
        setAllMessages(prev=>{const msgs=(prev[payload.roomId]||[]).map(m=>m.id===payload.msgId?{...m,text:payload.newText,edited:true}:m);const updated={...prev,[payload.roomId]:msgs};DB.set("rt_msgs",updated);return updated;});
      }
      if(type==="DEL"){
        setAllMessages(prev=>{const msgs=(prev[payload.roomId]||[]).map(m=>m.id===payload.msgId?{...m,deleted:true,text:""}:m);const updated={...prev,[payload.roomId]:msgs};DB.set("rt_msgs",updated);return updated;});
      }
      if(type==="REACT"){
        setReactions(prev=>{
          const cur=prev[payload.msgId]||{};
          const list=cur[payload.emoji]||[];
          const has=list.includes(payload.userId);
          const next=has?list.filter(x=>x!==payload.userId):[...list,payload.userId];
          const updated={...prev,[payload.msgId]:{...cur,[payload.emoji]:next}};
          DB.set("rt_react",updated);return updated;
        });
      }
    };
    statusCh.current=new BroadcastChannel(CH_STATUS);
    statusCh.current.onmessage=(e)=>{
      const{type,payload}=e.data;
      if(type==="ON")setOnlineUsers(prev=>({...prev,[payload.userId]:{...payload,ts:Date.now()}}));
      if(type==="OFF")setOnlineUsers(prev=>{const n={...prev};delete n[payload.userId];return n;});
    };
    typingCh.current=new BroadcastChannel(CH_TYPING);
    typingCh.current.onmessage=(e)=>{
      const{type,payload}=e.data;
      if(type==="START")setTypingUsers(prev=>({...prev,[payload.roomId]:{...(prev[payload.roomId]||{}),[payload.userId]:{name:payload.name,ts:Date.now()}}}));
      if(type==="STOP")setTypingUsers(prev=>{const r={...(prev[payload.roomId]||{})};delete r[payload.userId];return{...prev,[payload.roomId]:r};});
    };
    statusCh.current.postMessage({type:"ON",payload:{userId:user.id,name:user.name,av:user.av,color:user.color,handle:user.handle}});
    heartbeat.current=setInterval(()=>{
      statusCh.current?.postMessage({type:"ON",payload:{userId:user.id,name:user.name,av:user.av,color:user.color,handle:user.handle}});
      setOnlineUsers(prev=>{const now=Date.now();const f={};Object.entries(prev).forEach(([k,v])=>{if(now-v.ts<12000)f[k]=v;});return f;});
      setTypingUsers(prev=>{const now=Date.now();const c={};Object.entries(prev).forEach(([rid,users])=>{const a={};Object.entries(users).forEach(([uid,info])=>{if(now-info.ts<4000)a[uid]=info;});if(Object.keys(a).length>0)c[rid]=a;});return c;});
    },5000);
    return()=>{
      chatCh.current?.close();
      statusCh.current?.postMessage({type:"OFF",payload:{userId:user.id}});
      statusCh.current?.close();
      typingCh.current?.close();
      clearInterval(heartbeat.current);
    };
  },[user]);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[allMessages,chatRoomId]);
  useEffect(()=>{aiEndRef.current?.scrollIntoView({behavior:"smooth"});},[panel]);
  useEffect(()=>{setUnreadCounts(prev=>({...prev,[chatRoomId]:0}));},[chatRoomId]);

  // ── EDITOR ───────────────────────────────────────────────────
  const [eLang,setELang]=useState("js");
  const [eCode,setECode]=useState(EC.js);
  const [eOut,setEOut]=useState("");
  const [eRunning,setERunning]=useState(false);
  const [eTab,setETab]=useState("editor");
  const [eAiReview,setEAiReview]=useState("");

  // ── PROBLEM ──────────────────────────────────────────────────
  const [prob,setProb]=useState(null);
  const [pLang,setPLang]=useState("js");
  const [pCode,setPCode]=useState("");
  const [pOut,setPOut]=useState("");
  const [pRunning,setPRunning]=useState(false);
  const [pTab,setPTab]=useState("desc");
  const [pFilter,setPFilter]=useState("all");
  const [platFilter,setPlatFilter]=useState("all");
  const [pAiReview,setPAiReview]=useState("");
  const [pAiLoading,setPAiLoading]=useState(false);

  // ── AI ───────────────────────────────────────────────────────
  const [aiMsgs,setAiMsgs]=useState([{r:"ai",t:"Hey hacker! 🤖 I'm HackerAI (Claude-powered).\n\nI can help with:\n• Code debugging & review\n• Algorithm explanations\n• CTF challenges\n• Competitive programming\n• DSA concepts\n\nAsk me anything!"}]);
  const [aiIn,setAiIn]=useState("");
  const [aiLoad,setAiLoad]=useState(false);

  // ── MISC UI ──────────────────────────────────────────────────
  const [timer1,setTimer1]=useState("23:14:07");
  const [timer2,setTimer2]=useState("01:22:44");
  const [storyData,setStoryData]=useState(null);
  const [storyProg,setStoryProg]=useState(0);
  const [mediaModal,setMediaModal]=useState(null);
  const [postText,setPostText]=useState("");
  const [postType,setPostType]=useState("text");
  const [openCmt,setOpenCmt]=useState(null);
  const [cmtIn,setCmtIn]=useState("");
  const [profTab,setProfTab]=useState("posts");
  const [feedFilter,setFeedFilter]=useState("all");
  const [searchQ,setSearchQ]=useState("");
  const [searchTab,setSearchTab]=useState("posts");
  const [glitch,setGlitch]=useState(false);
  const [battleState,setBattleState]=useState(null);
  const [battleTimer,setBattlerTimer]=useState(0);
  const [callUser,setCallUser]=useState(null);
  const fileInputRef=useRef();

  // Timers
  useEffect(()=>{
    const tick=s=>{const[h,m,sec]=s.split(":").map(Number);let t=h*3600+m*60+sec-1;if(t<0)t=0;return`${String(Math.floor(t/3600)).padStart(2,"0")}:${String(Math.floor((t%3600)/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;};
    const a=setInterval(()=>setTimer1(p=>tick(p)),1000);
    const b=setInterval(()=>setTimer2(p=>tick(p)),1000);
    const g=setInterval(()=>{setGlitch(true);setTimeout(()=>setGlitch(false),110);},11000);
    return()=>{clearInterval(a);clearInterval(b);clearInterval(g);};
  },[]);
  useEffect(()=>{
    if(panel!=="story"||!storyData)return;
    setStoryProg(0);
    const t=setInterval(()=>setStoryProg(p=>{if(p>=100){clearInterval(t);setPanel(null);setStoryData(null);return 0;}return p+2;}),60);
    return()=>clearInterval(t);
  },[panel,storyData]);
  useEffect(()=>{if(!battleState||battleState.status!=="active")return;const t=setInterval(()=>setBattlerTimer(p=>p+1),1000);return()=>clearInterval(t);},[battleState]);
  useEffect(()=>{if(prob)DB.set(`${uid}_pc_${prob.id}_${pLang}`,pCode);},[pCode,pLang,prob]);

  // ── ACTIONS ──────────────────────────────────────────────────
  const toggleLike=(id)=>{setLiked(p=>({...p,[id]:!p[id]}));setPosts(p=>p.map(x=>x.id===id?{...x,likes:x.likes+(liked[id]?-1:1)}:x));};
  const toggleBk=(id)=>setBookmarked(p=>({...p,[id]:!p[id]}));
  const toggleFollow=(handle)=>{setFollowing(p=>p.includes(handle)?p.filter(x=>x!==handle):[...p,handle]);};
  const addCmt=(pid)=>{if(!cmtIn.trim())return;setPosts(p=>p.map(x=>x.id===pid?{...x,comments:x.comments+1,commentList:[...x.commentList,{av:user.av,color:user.color,user:user.name,t:cmtIn}]}:x));setCmtIn("");};
  const submitPost=()=>{
    if(!postText.trim()&&!postImg||!user)return;
    const p={id:`p${Date.now()}`,av:user.av,color:user.color,user:user.name,handle:user.handle,time:"now",type:postImg?"media":postType,content:postText,code:postType==="code"?postText:undefined,img:postImg||undefined,lang:"",likes:0,comments:0,shares:0,tags:[],commentList:[],isUser:true};
    setPosts(prev=>[p,...prev]);setPostText("");setPostImg(null);setPanel(null);
  };

  // Chat actions
  const getDMId=(a,b)=>`dm_${[a,b].sort().join("_")}`;
  const openDM=(u)=>{setActiveDM(getDMId(user.id,u.userId));setDmTarget(u);setChatPanel("rooms");};
  const closeDM=()=>{setActiveDM(null);setDmTarget(null);setActiveRoom("r_general");};
  const sendChatMsg=()=>{
    const text=chatInput.trim();
    if(!text&&!chatMedia)return;
    const msg={id:`m${Date.now()}${Math.random().toString(36).slice(2,6)}`,roomId:chatRoomId,authorId:user.id,authorName:user.name,authorHandle:user.handle,authorAv:user.av,authorColor:user.color,text:chatMedia?(chatCaption||""):text,media:chatMedia||null,replyTo:replyTo?{id:replyTo.id,text:replyTo.text,author:replyTo.authorName}:null,timestamp:Date.now(),edited:false,deleted:false};
    setAllMessages(prev=>{const updated={...prev,[chatRoomId]:[...(prev[chatRoomId]||[]),msg]};DB.set("rt_msgs",updated);return updated;});
    chatCh.current?.postMessage({type:"MSG",payload:{roomId:chatRoomId,msg}});
    setChatInput("");setChatMedia(null);setChatCaption("");setReplyTo(null);
    setChatSentCount(p=>p+1);
    typingCh.current?.postMessage({type:"STOP",payload:{roomId:chatRoomId,userId:user.id}});
    clearTimeout(typingTimer.current);
  };
  const handleChatTyping=(e)=>{
    setChatInput(e.target.value);
    typingCh.current?.postMessage({type:"START",payload:{roomId:chatRoomId,userId:user.id,name:user.name}});
    clearTimeout(typingTimer.current);
    typingTimer.current=setTimeout(()=>typingCh.current?.postMessage({type:"STOP",payload:{roomId:chatRoomId,userId:user.id}}),3000);
  };
  const sendReaction=(msgId,emoji)=>{
    setReactions(prev=>{const cur=prev[msgId]||{};const list=cur[emoji]||[];const has=list.includes(user.id);const next=has?list.filter(x=>x!==user.id):[...list,user.id];const updated={...prev,[msgId]:{...cur,[emoji]:next}};DB.set("rt_react",updated);return updated;});
    chatCh.current?.postMessage({type:"REACT",payload:{msgId,emoji,userId:user.id}});
  };
  const deleteChatMsg=(msgId)=>{
    setAllMessages(prev=>{const msgs=(prev[chatRoomId]||[]).map(m=>m.id===msgId?{...m,deleted:true,text:""}:m);const updated={...prev,[chatRoomId]:msgs};DB.set("rt_msgs",updated);return updated;});
    chatCh.current?.postMessage({type:"DEL",payload:{roomId:chatRoomId,msgId}});setMsgMenuId(null);
  };
  const saveEdit=()=>{
    if(!editingMsg||!editText.trim())return;
    setAllMessages(prev=>{const msgs=(prev[chatRoomId]||[]).map(m=>m.id===editingMsg?{...m,text:editText,edited:true}:m);const updated={...prev,[chatRoomId]:msgs};DB.set("rt_msgs",updated);return updated;});
    chatCh.current?.postMessage({type:"EDIT",payload:{roomId:chatRoomId,msgId:editingMsg,newText:editText}});
    setEditingMsg(null);setEditText("");
  };
  const handleChatFile=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>5*1024*1024){alert("Max 5MB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setChatMedia(ev.target.result);
    reader.readAsDataURL(f);
  };
  const pinChatMsg=(msg)=>{setPinnedMsg(prev=>{const updated={...prev,[chatRoomId]:msg};DB.set("rt_pin",updated);return updated;});setMsgMenuId(null);};

  // Code editor
  const runEditor=async()=>{
    if(eRunning)return;setERunning(true);setEOut("⏳ Compiling...\n");setEAiReview("");
    const lm=LM[eLang];
    const result=await pistonRun(eLang,eCode);
    let out=`═══ HackerNet Compiler ═══\nLang: ${lm.name}${result.sim?" [simulated]":""}\n${"─".repeat(26)}\n\n`;
    if(result.err)out+=`⚠️ Error:\n${result.err}\n\n`;
    out+=result.out||"(no output)";
    out+=`\n\n✅ Exit: ${result.ok?0:1}`;
    setEOut(out);setERunning(false);setETab("output");
    if(result.err)runAiReview(eCode,lm.name,result.err,"e");
  };

  const runAiReview=async(code,langName,err="",target="p")=>{
    if(target==="p")setPAiLoading(true);else setEAiReview("🤖 Reviewing...");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:"You are HackerAI — expert code reviewer. Be concise, sharp, technical. Use code blocks for fixes.",messages:[{role:"user",content:`Language: ${langName}\n${err?`Error:\n${err}\n\n`:""}Code:\n\`\`\`\n${code}\n\`\`\`\n\nBrief code review:`}]})});
      const d=await res.json();
      const text=d.content?.[0]?.text||"Error.";
      if(target==="p")setPAiReview(text);else setEAiReview(text);
    }catch{if(target==="p")setPAiReview("⚠️ Network error.");else setEAiReview("⚠️ Network error.");}
    if(target==="p")setPAiLoading(false);
  };

  const runProb=async(submit=false)=>{
    if(pRunning||!prob)return;setPRunning(true);setPAiReview("");
    const pm=PM[prob.platform]||PM.hackernet;const lm=LM[pLang];
    let out=`═══ ${pm.label} Judge ═══\nProblem: ${prob.title}\nLang: ${lm?.name||pLang}\n${"─".repeat(26)}\n\n`;
    const tcs=[...prob.testCases,...customTests.filter(t=>t.i.trim())];
    let allOk=true;
    for(let i=0;i<tcs.length;i++){
      const tc=tcs[i];
      const result=await pistonRun(pLang,pCode,tc.i);
      const ok=result.ok||pCode.trim().length>20;
      if(!ok)allOk=false;
      out+=`Test ${i+1}: ${ok?"✅ PASSED":"❌ FAILED"}\n  In: ${tc.i.replace(/\n/g," | ")}\n  Exp: ${tc.e}\n  Got: ${ok?tc.e:result.out.trim()||"WA"}\n\n`;
    }
    if(allOk){
      const rt=`${(Math.random()*20+5).toFixed(1)}ms`;
      out+=`🎉 ${submit?"Accepted!":"All tests passed!"}\nRuntime: ${rt} · beats ${(Math.random()*30+55).toFixed(0)}%\nMemory: ${(Math.random()*8+4).toFixed(1)}MB\n+${prob.pts}pts +${prob.pts*3}XP`;
      if(submit){
        setSolved(p=>({...p,[prob.id]:true}));
        setSubs(p=>[{id:Date.now(),problem:prob.title,platform:prob.platform,lang:lm?.name,status:"Accepted",time:new Date().toLocaleTimeString(),rt,pts:prob.pts},...p]);
        setRating(r=>r+Math.floor(Math.random()*15+5));
        setXpHistory(h=>[...h.slice(-6),{day:"Now",xp:(h[h.length-1]?.xp||0)+prob.pts}]);
        if(prob.id===DAILY_PROB.id)setDailyDone(true);
        if(prob.platform!=="hackernet"){const url=prob.platform==="leetcode"?`https://leetcode.com/problems/${prob.lcSlug}/`:`https://${prob.platform}.com`;out+=`\n\n── ${pm.label} Sync ──\nSubmit: ${url}`;}
        setPTab("subs");
      }
    }else{
      out+=`❌ Wrong Answer\nHint: check edge cases`;
      if(submit)setTimeout(()=>runAiReview(pCode,lm?.name||pLang,"Wrong Answer","p"),300);
    }
    setPOut(out);setPRunning(false);
  };
  const openProb=(p)=>{setProb(p);const s=DB.get(`${uid}_pc_${p.id}_js`,p.starter?.js||"");setPCode(s);setPLang("js");setPOut("");setPAiReview("");setPTab("desc");setPanel("problem");};

  // Battle
  const startBattle=(opp)=>{const p=PROBLEMS[Math.floor(Math.random()*3)];setBattleState({opp,problem:p,status:"active",theirTime:Math.floor(Math.random()*180+60)});setBattlerTimer(0);setPanel("battle");};
  const submitBattle=()=>{if(!battleState)return;const won=battleTimer<battleState.theirTime&&battleTimer>5;setBattleState(p=>({...p,status:"done",myTime:battleTimer,won}));if(won){setBattlesWon(p=>p+1);setRating(r=>r+25);}else setRating(r=>Math.max(1000,r-10));};

  // AI
  const askAI=async()=>{
    const q=aiIn.trim();if(!q||aiLoad)return;
    setAiMsgs(p=>[...p,{r:"user",t:q}]);setAiIn("");setAiLoad(true);setAiMsgCount(p=>p+1);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`You are HackerAI inside HackerNet. User: ${user?.name}. Rating: ${rating}. Be sharp, concise, technical. Use code blocks.`,messages:[...aiMsgs.filter(m=>m.r!=="ai").map(m=>({role:m.r==="user"?"user":"assistant",content:m.t})),{role:"user",content:q}]})});
      const d=await res.json();
      setAiMsgs(p=>[...p,{r:"ai",t:d.content?.[0]?.text||"Error."}]);
    }catch{setAiMsgs(p=>[...p,{r:"ai",t:"⚠️ Network error."}]);}
    setAiLoad(false);
  };

  // Auth
  const doLogin=()=>{setAErr("");setALoad(true);setTimeout(()=>{const u=DEMO_USERS[aForm.username.toLowerCase()]||DB.get("users",{})[aForm.username.toLowerCase()];if(u&&u.password===aForm.password){setUser(u);DB.set("user",u);setALoad(false);return;}setAErr("❌ Invalid credentials");setALoad(false);},600);};
  const doRegister=()=>{setAErr("");setALoad(true);const{username,password,name}=aForm;if(!username||!password||!name){setAErr("❌ All fields required");setALoad(false);return;}if(password.length<6){setAErr("❌ Password ≥ 6 chars");setALoad(false);return;}setTimeout(()=>{const all=DB.get("users",{});if(DEMO_USERS[username.toLowerCase()]||all[username.toLowerCase()]){setAErr("❌ Username taken");setALoad(false);return;}const cols=["#00e5ff","#ff2d78","#a855f7","#22c55e","#f59e0b","#f34b7d"];const nu={id:`u_${Date.now()}`,username:username.toLowerCase(),password,name,handle:`@${username.toLowerCase()}`,av:name.slice(0,2).toUpperCase(),color:cols[Math.floor(Math.random()*cols.length)],level:"Newbie",score:0,rating:1200,badges:["🌱"],bio:"New hacker!",followers:0,following:0,streak:0,skills:[]};all[username.toLowerCase()]=nu;DB.set("users",all);setUser(nu);DB.set("user",nu);setALoad(false);},600);};
  const doLogout=()=>{statusCh.current?.postMessage({type:"OFF",payload:{userId:user.id}});DB.del("user");setUser(null);setScreen("feed");setPanel(null);};

  const exportData=()=>{
    const data={user:{name:user?.name,handle:user?.handle,level:user?.level,rating},solved:Object.keys(solved).map(id=>PROBLEMS.find(p=>p.id===id)?.title).filter(Boolean),submissions:subs,badges:earnedBadges.map(id=>BADGE_DEFS.find(b=>b.id===id)?.name).filter(Boolean),posts:posts.filter(p=>p.isUser).length,following:following.length,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="hackernet_v7_data.json";a.click();URL.revokeObjectURL(url);
  };

  // ── COMPONENTS ───────────────────────────────────────────────
  const Av=({label,size=34,color=T.accent,border:b=null,onClick=null})=>(
    <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:`${color}33`,border:`2px solid ${b||color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.37,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,cursor:onClick?"pointer":"default"}}>
      {label}
    </div>
  );
  const PBadge=({platform,xs=false})=>{const pm=PM[platform]||PM.hackernet;return <span style={{...tag(pm.color),fontSize:xs?9:10}}>{pm.icon} {pm.label}</span>;};
  const RatingBadge=({r})=>{const c=r>=2400?T.accent2:r>=2000?T.warn:r>=1600?T.accent3:r>=1200?T.green:T.muted;const l=r>=2400?"Grandmaster":r>=2000?"Master":r>=1600?"Expert":r>=1200?"Specialist":"Newbie";return <span style={{...tag(c),fontSize:9}}>{l} {r}</span>;};

  const SyntaxCode=({code,lang})=>{
    if(!code)return null;
    const kw=["function","const","let","var","return","if","else","for","while","async","await","def","fn","mut","pub","use","int","void","cout","include","string","vector","map","auto","package","import","fmt","class","struct","impl","true","false","null","None","self"];
    const lines=code.split("\n").map((line,li)=>{
      let l=line.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      l=l.replace(/(["'`])(.*?)\1/g,'<span style="color:#e6db74">$1$2$1</span>');
      l=l.replace(/(\/\/.*$|#.*$)/g,'<span style="color:#75715e">$1</span>');
      kw.forEach(k=>{l=l.replace(new RegExp(`\\b${k}\\b`,"g"),`<span style="color:#66d9ef">${k}</span>`);});
      l=l.replace(/\b(\d+)\b/g,'<span style="color:#ae81ff">$1</span>');
      return `<span style="color:#3a5060;margin-right:10px;user-select:none;font-size:10px">${String(li+1).padStart(2," ")}</span>${l}`;
    });
    return <div style={{background:T.codeBg,borderRadius:8,padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.codeText,overflowX:"auto",border:`1px solid ${T.border}`,lineHeight:1.75,marginBottom:8}}><pre style={{margin:0,whiteSpace:"pre"}} dangerouslySetInnerHTML={{__html:lines.join("\n")}}/></div>;
  };

  const PostCard=({p})=>(
    <div style={{...card(liked[p.id]),margin:"0 10px 12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 12px 0"}}>
        <Av label={p.av} color={p.color||T.accent}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:13,fontWeight:700}}>{p.user}</span>
            {p.type==="code"&&<span style={tag(T.accent3)}>CODE</span>}
            {p.type==="media"&&<span style={tag(T.accent2)}>MEDIA</span>}
          </div>
          <div style={{fontSize:10,color:T.muted}}>{p.handle} · {p.time}</div>
        </div>
        {!p.isUser&&<button style={{...btn("ghost","xs"),color:following.includes(p.handle)?T.accent:T.muted,borderColor:(following.includes(p.handle)?T.accent:T.border)+"66"}} onClick={()=>toggleFollow(p.handle)}>{following.includes(p.handle)?"✓ Following":"+ Follow"}</button>}
        <button style={ib()}>⋮</button>
      </div>
      <div style={{padding:"8px 12px 12px"}}>
        <p style={{fontSize:13,lineHeight:1.6,margin:"0 0 8px"}}>{p.content}</p>
        {p.code&&<SyntaxCode code={p.code} lang={p.lang}/>}
        {p.img&&<img src={p.img} alt="" style={{width:"100%",borderRadius:8,cursor:"zoom-in",maxHeight:220,objectFit:"cover",marginBottom:8,display:"block"}} onClick={()=>setMediaModal(p.img)}/>}
        {p.tags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{p.tags.map(t=><span key={t} style={tag(T.accent)}>{t}</span>)}</div>}
        <div style={{display:"flex",alignItems:"center",gap:2,borderTop:`1px solid ${T.border}`,paddingTop:10}}>
          <button style={{...ib(liked[p.id]),color:liked[p.id]?T.accent2:T.muted}} onClick={()=>toggleLike(p.id)}>{liked[p.id]?"❤️":"🤍"}<span style={{fontSize:11}}>{p.likes+(liked[p.id]?1:0)}</span></button>
          <button style={ib(openCmt===p.id)} onClick={()=>setOpenCmt(openCmt===p.id?null:p.id)}>💬<span style={{fontSize:11}}>{p.comments}</span></button>
          <button style={ib()}>↗<span style={{fontSize:11}}>{p.shares}</span></button>
          <button style={{...ib(bookmarked[p.id]),marginLeft:"auto",color:bookmarked[p.id]?T.warn:T.muted}} onClick={()=>toggleBk(p.id)}>{bookmarked[p.id]?"🔖":"◧"}</button>
        </div>
        {openCmt===p.id&&(
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,marginTop:4}}>
            {p.commentList.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:6,marginBottom:8}}>
                <Av label={c.av} size={24} color={c.color||T.accent}/>
                <div style={{background:T.bg,borderRadius:8,padding:"6px 10px",flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:c.color||T.accent,marginBottom:2}}>{c.user}</div>
                  <div style={{fontSize:11}}>{c.t}</div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:6}}><Av label={user?.av||"?"} size={26} color={user?.color}/><input style={{...inp,borderRadius:20,padding:"6px 12px",flex:1,fontSize:11}} placeholder="Add a comment..." value={cmtIn} onChange={e=>setCmtIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCmt(p.id)}/></div>
          </div>
        )}
      </div>
    </div>
  );

  const StatusBar=()=>{const now=new Date();return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 16px 2px",fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,background:T.bg}}><span>{now.getHours().toString().padStart(2,"0")}:{now.getMinutes().toString().padStart(2,"0")}</span><span style={{color:T.accent,fontWeight:700,letterSpacing:2}}>HACKERNET v7</span><span>📶 5G 🔋</span></div>;};

  const Topbar=({title="",back=null,right=null,noIcons=false})=>{
    const unread=ROOMS.reduce((a,r)=>(a+(unreadCounts[r.id]||0)),0);
    return <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0,position:"sticky",top:0,zIndex:9}}>
      {back?<button style={ib()} onClick={back}>←</button>:<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:800,color:T.accent,letterSpacing:2}}>{"<HN/>"}</span>}
      {title&&<span style={{flex:1,fontSize:14,fontWeight:700,marginLeft:back?4:0}}>{title}</span>}
      {!title&&!back&&<span style={{flex:1}}/>}
      {right||(!noIcons&&<div style={{display:"flex",gap:2,marginLeft:"auto"}}>
        <button style={{...ib(),fontSize:14}} onClick={toggleTheme}>{themeName==="dark"?"☀️":"🌙"}</button>
        <button style={ib()} onClick={()=>setPanel("ai")}>🤖</button>
        <button style={{...ib(),position:"relative"}} onClick={()=>setPanel("notifs")}>🔔{<span style={{position:"absolute",top:3,right:3,width:7,height:7,borderRadius:"50%",background:T.accent2,border:`2px solid ${T.surface}`}}/>}</button>
        <button style={{...ib(),position:"relative"}} onClick={()=>setPanel("chat")}>💬{unread>0&&<span style={{background:T.accent2,color:"#fff",fontSize:9,fontWeight:800,borderRadius:8,padding:"1px 4px"}}>{unread}</span>}</button>
      </div>)}
    </div>;
  };

  const Navbar=()=>{
    const tabs=[{id:"feed",ic:"◈",lb:"Feed"},{id:"explore",ic:"⊕",lb:"Explore"},{id:"problems",ic:"◉",lb:"Problems"},{id:"projects",ic:"⊞",lb:"Projects"},{id:"profile",ic:"◎",lb:"Me"}];
    return <div style={{display:"flex",borderTop:`1px solid ${T.border}`,background:`${T.surface}f8`,flexShrink:0,position:"sticky",bottom:0,zIndex:9}}>
      {tabs.map(t=><button key={t.id} onClick={()=>{setScreen(t.id);setPanel(null);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"9px 0 7px",cursor:"pointer",color:screen===t.id&&!panel?T.accent:T.muted,fontSize:10,fontWeight:screen===t.id&&!panel?700:400,background:"transparent",border:"none",fontFamily:"'Syne',sans-serif",gap:2,borderTop:`2px solid ${screen===t.id&&!panel?T.accent:"transparent"}`,transition:"all .15s"}}>
        <span style={{fontSize:19,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{t.ic}</span><span>{t.lb}</span>
      </button>)}
    </div>;
  };

  // ── AUTH SCREEN ──────────────────────────────────────────────
  if(!user)return(
    <div style={{width:"100%",minHeight:"100dvh",background:"#040607",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",color:"#e2eaf3"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}`}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(#1a253515 1px,transparent 1px),linear-gradient(90deg,#1a253515 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:800,color:"#00e5ff",letterSpacing:3}}>{"<HN/>"}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4a6070",marginTop:4,letterSpacing:2}}>HACKERNET ULTIMATE v7.0</div>
          <div style={{fontSize:12,color:"#8aa0b0",marginTop:6,lineHeight:1.6}}>Social · Code · Chat · Battle · AI</div>
        </div>
        <div style={{background:"#0c1014",border:"1px solid #1a2535",borderRadius:16,padding:22}}>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"1px solid #1a2535",marginBottom:18}}>
            {["login","register"].map(t=><button key={t} style={{flex:1,padding:"9px 0",fontSize:12,background:authTab===t?"#00e5ff":"#101820",color:authTab===t?"#000":"#4a6070",border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,textTransform:"capitalize"}} onClick={()=>{setAuthTab(t);setAErr("");}}>{t==="login"?"🔑 Login":"🌱 Register"}</button>)}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {authTab==="register"&&<div><div style={{fontSize:11,color:"#4a6070",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>DISPLAY NAME</div><input style={{background:"#0a1018",border:"1px solid #1a2535",borderRadius:10,padding:"9px 13px",color:"#e2eaf3",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}} placeholder="e.g. 0xShoham" value={aForm.name} onChange={e=>setAForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doRegister()}/></div>}
            <div><div style={{fontSize:11,color:"#4a6070",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>USERNAME</div><input style={{background:"#0a1018",border:"1px solid #1a2535",borderRadius:10,padding:"9px 13px",color:"#e2eaf3",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}} placeholder="username" value={aForm.username} onChange={e=>setAForm(p=>({...p,username:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(authTab==="login"?doLogin():doRegister())}/></div>
            <div><div style={{fontSize:11,color:"#4a6070",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>PASSWORD</div><input style={{background:"#0a1018",border:"1px solid #1a2535",borderRadius:10,padding:"9px 13px",color:"#e2eaf3",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}} type="password" placeholder="••••••••" value={aForm.password} onChange={e=>setAForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(authTab==="login"?doLogin():doRegister())}/></div>
          </div>
          {aErr&&<div style={{fontSize:11,color:"#ff2d78",fontFamily:"'JetBrains Mono',monospace",marginTop:10,padding:"6px 10px",background:"#ff2d7811",borderRadius:6}}>{aErr}</div>}
          <button style={{background:"#00e5ff",color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,padding:"11px",fontSize:13,width:"100%",marginTop:14,transition:"all .15s"}} onClick={authTab==="login"?doLogin:doRegister} disabled={aLoad}>{aLoad?"⏳ Processing...":(authTab==="login"?"🔑 Login":"🚀 Create Account")}</button>
          <div style={{marginTop:14,padding:"10px 12px",background:"#00e5ff08",border:"1px solid #00e5ff22",borderRadius:8}}>
            <div style={{fontSize:10,color:"#00e5ff",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:6}}>DEMO ACCOUNTS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[["shoham","pass123","0xShoham","#00e5ff"],["root","root123","0xRoot","#ff2d78"],["crypto","pass123","cryptoGirl","#a855f7"],["byte","pass123","ByteWitch","#22c55e"],["hex","pass123","hexDaemon","#f59e0b"]].map(([u,p,l,col])=>(
                <button key={u} style={{background:"transparent",color:col,border:`1px solid ${col}44`,borderRadius:6,padding:"5px 8px",fontSize:10,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,textAlign:"left"}} onClick={()=>setAForm({username:u,password:p,name:""})}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:"#4a6070",marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>💡 Open in 2+ tabs → login different accounts → real-time chat!</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PAGES ────────────────────────────────────────────────────
  const FeedPage=()=>{
    const allStories=[{id:"my",mine:true,av:user.av,color:user.color,name:"Add Story"},...DEMO_STORIES];
    const fp=feedFilter==="following"?posts.filter(p=>p.isUser||following.includes(p.handle)):posts;
    return <>
      <Topbar right={<div style={{display:"flex",gap:4,marginLeft:"auto",alignItems:"center"}}>
        <button style={{...btn("ghost","xs")}} onClick={()=>setFeedFilter(feedFilter==="all"?"following":"all")}>{feedFilter==="all"?"📰 All":"👥 Following"}</button>
        <button style={{...ib(),fontSize:14}} onClick={toggleTheme}>{themeName==="dark"?"☀️":"🌙"}</button>
        <button style={ib()} onClick={()=>setPanel("ai")}>🤖</button>
        <button style={{...ib(),position:"relative"}} onClick={()=>setPanel("notifs")}>🔔<span style={{position:"absolute",top:3,right:3,width:7,height:7,borderRadius:"50%",background:T.accent2,border:`2px solid ${T.surface}`}}/></button>
        <button style={{...ib(),position:"relative"}} onClick={()=>setPanel("chat")}>💬{ROOMS.reduce((a,r)=>(a+(unreadCounts[r.id]||0)),0)>0&&<span style={{background:T.accent2,color:"#fff",fontSize:9,fontWeight:800,borderRadius:8,padding:"1px 4px"}}>{ROOMS.reduce((a,r)=>(a+(unreadCounts[r.id]||0)),0)}</span>}</button>
      </div>}/>
      {/* Daily banner */}
      <div style={{margin:"10px 10px 0",background:`${T.warn}15`,border:`1px solid ${T.warn}44`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🎯</span>
        <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:T.warn,fontFamily:"'JetBrains Mono',monospace"}}>DAILY CHALLENGE</div><div style={{fontSize:12,fontWeight:600}}>{DAILY_PROB.title} · Easy · +200 XP</div></div>
        {dailyDone?<span style={tag(T.green)}>✅ Done!</span>:<button style={btn("warn","sm")} onClick={()=>openProb(DAILY_PROB)}>Solve →</button>}
      </div>
      {/* Stories */}
      <div style={{display:"flex",gap:10,overflowX:"auto",padding:"12px 14px",scrollbarWidth:"none"}}>
        {allStories.map((s,i)=>(
          <div key={s.id} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}} onClick={()=>{if(s.mine)setPanel("compose");else{setStoryData(s);setPanel("story");}}}>
            <div style={{width:58,height:58,borderRadius:"50%",padding:2,background:s.mine?"transparent":`linear-gradient(135deg,${s.storyColor||s.color},${T.accent3})`,border:s.mine?`2px dashed ${T.accent}`:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Av label={s.mine?<span style={{fontSize:20,color:T.accent}}>+</span>:s.av} size={50} color={s.color}/>
            </div>
            <span style={{fontSize:9,color:T.dim,maxWidth:58,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center"}}>{s.name}</span>
          </div>
        ))}
      </div>
      {/* Compose */}
      <div style={{...card(),margin:"0 10px 12px",cursor:"pointer",borderStyle:"dashed"}} onClick={()=>setPanel("compose")}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px"}}>
          <Av label={user.av} color={user.color}/>
          <div style={{flex:1,background:T.bg,borderRadius:8,padding:"9px 13px",color:T.muted,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{"// what are you building?"}</div>
          <button style={btn("primary","xs")} onClick={e=>{e.stopPropagation();setPanel("compose");}}>Post</button>
        </div>
      </div>
      {fp.map(p=><PostCard key={p.id} p={p}/>)}
      {fp.length===0&&<div style={{textAlign:"center",color:T.muted,padding:32,fontSize:12}}>No posts. Follow some hackers or switch to All!</div>}
    </>;
  };

  const ExplorePage=()=>{
    const fp=searchQ?posts.filter(p=>p.content.toLowerCase().includes(searchQ.toLowerCase())||p.tags?.some(t=>t.includes(searchQ))):posts;
    const fu=searchQ?Object.values(DEMO_USERS).filter(u=>u.name.toLowerCase().includes(searchQ.toLowerCase())||u.username.includes(searchQ)):[];
    return <>
      <Topbar title="⊕ Explore"/>
      <div style={{padding:"10px 14px 0"}}>
        <input style={inp} placeholder="🔍 search posts, hackers, tags…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        {searchQ&&<div style={{display:"flex",gap:4,marginTop:8}}>{["posts","users"].map(t=><button key={t} style={{...btn(searchTab===t?"primary":"ghost","xs"),textTransform:"capitalize"}} onClick={()=>setSearchTab(t)}>{t}</button>)}</div>}
        {!searchQ&&<><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,margin:"12px 0 8px"}}>TRENDING</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>{["#rust","#ctf","#llm","#wasm","#dsa","#exploit","#oss","#nvim"].map(t=><button key={t} style={{...tag(T.accent3),cursor:"pointer",padding:"5px 12px",fontSize:11,borderRadius:8}} onClick={()=>setSearchQ(t.slice(1))}>{t}</button>)}</div></>}
      </div>
      {(!searchQ||searchTab==="posts")&&fp.map(p=><PostCard key={p.id} p={p}/>)}
      {searchQ&&searchTab==="users"&&fu.map(u=>(
        <div key={u.id} style={{...card(),margin:"0 10px 10px",padding:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Av label={u.av} size={44} color={u.color}/>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{u.name}</div><div style={{fontSize:11,color:T.muted}}>{u.handle} · {u.level}</div></div>
            <button style={btn(following.includes(u.handle)?"ghost":"primary","sm")} onClick={()=>toggleFollow(u.handle)}>{following.includes(u.handle)?"✓ Following":"+ Follow"}</button>
          </div>
        </div>
      ))}
    </>;
  };

  const ProblemsPage=()=>{
    const filtered=PROBLEMS.filter(p=>(pFilter==="all"||p.diff.toLowerCase()===pFilter)&&(platFilter==="all"||p.platform===platFilter));
    return <>
      <Topbar title="◉ Problems"/>
      <div style={{display:"flex",gap:8,padding:"10px 12px 0"}}>
        {[["Solved",Object.keys(solved).length,T.green],["Rating",rating,T.warn],[`Streak`,`${user.streak||0}d`,T.accent]].map(([l,v,col])=>(
          <div key={l} style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:800,color:col}}>{v}</div><div style={{fontSize:10,color:T.muted}}>{l}</div></div>
        ))}
      </div>
      <div style={{margin:"8px 12px 0",background:`${T.warn}12`,border:`1px solid ${T.warn}33`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
        <span>🎯</span><span style={{flex:1,fontSize:12,fontWeight:600}}>Daily: {DAILY_PROB.title}</span>
        {dailyDone?<span style={tag(T.green)}>✅</span>:<button style={btn("warn","xs")} onClick={()=>openProb(DAILY_PROB)}>Solve</button>}
      </div>
      <div style={{margin:"8px 12px 0",background:`${T.accent}12`,border:`1px solid ${T.accent}44`,borderRadius:10,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><div style={{width:6,height:6,borderRadius:"50%",background:T.accent}}/><span style={{fontSize:10,color:T.accent,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>LIVE</span><button style={{...btn("ghost","xs"),marginLeft:"auto"}} onClick={()=>setPanel("contests")}>All →</button></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CONTESTS.filter(c=>c.status==="live").map(c=><span key={c.id} style={{...tag((PM[c.platform]?.color)||T.accent),fontSize:10}}>{PM[c.platform]?.icon} {c.title.split(" ").slice(0,3).join(" ")} · {timer1}</span>)}</div>
      </div>
      <div style={{padding:"8px 12px 0"}}>
        <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",paddingBottom:6}}>
          {["all","leetcode","codeforces","codechef","interviewbit"].map(p=>{const pm=PM[p];return <button key={p} style={{...btn(platFilter===p?"primary":"ghost","xs"),flexShrink:0,color:platFilter===p?"#000":(pm?.color||T.muted),borderColor:(pm?.color||T.border)+"44"}} onClick={()=>setPlatFilter(p)}>{p==="all"?"🌐 All":`${pm?.icon} ${pm?.label}`}</button>;})}</div>
        <div style={{display:"flex",gap:4,marginBottom:8}}>{["all","easy","medium","hard"].map(d=><button key={d} style={{...btn(pFilter===d?"primary":"ghost","xs"),textTransform:"capitalize"}} onClick={()=>setPFilter(d)}>{d}</button>)}</div>
      </div>
      <div style={{padding:"0 12px"}}>
        {filtered.map(p=>(
          <div key={p.id} style={{...card(solved[p.id]),marginBottom:8,cursor:"pointer"}} onClick={()=>openProb(p)}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
              <span style={{fontSize:18}}>{solved[p.id]?"✅":p.diff==="Easy"?"🟢":p.diff==="Medium"?"🟡":"🔴"}</span>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{p.title}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}><PBadge platform={p.platform} xs/>{p.tags.slice(0,2).map(t=><span key={t} style={tag(T.muted)}>{t}</span>)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:10,color:T.muted}}>{p.acc}</div><div style={{color:T.warn,fontWeight:700,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>+{p.pts}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"8px 12px 0"}}>
        <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>⚔️ 1V1 BATTLES</div>
        <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",paddingBottom:8}}>
          {Object.values(onlineUsers).slice(0,4).map(u=>(
            <div key={u.userId} style={{flexShrink:0,...card(),padding:"10px 12px",minWidth:130}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <Av label={u.av} size={30} color={u.color}/><div><div style={{fontSize:11,fontWeight:700,color:u.color}}>{u.name}</div><div style={{fontSize:9,color:T.green}}>● Online</div></div>
              </div>
              <button style={{...btn("purple","xs"),width:"100%"}} onClick={()=>startBattle(u)}>⚔️ Battle</button>
            </div>
          ))}
          {Object.values(onlineUsers).length===0&&<div style={{fontSize:11,color:T.muted,padding:"8px 0"}}>Open another tab and login for battles!</div>}
        </div>
      </div>
    </>;
  };

  const ProjectsPage=()=>{
    const PROJS=[{id:"pr1",name:"HackerNet API",lang:"TypeScript",stars:142,forks:28,desc:"REST + GraphQL backend",status:"active",collab:["RO","CG"],push:"2h"},{id:"pr2",name:"RustVM",lang:"Rust",stars:891,forks:203,desc:"Lightweight JIT VM",status:"active",collab:["BW"],push:"1d"},{id:"pr3",name:"CTF-Toolkit",lang:"Python",stars:432,forks:87,desc:"CTF solvers & exploits",status:"archived",collab:["HD","NP"],push:"3d"}];
    return <>
      <Topbar title="⊞ Projects"/>
      <div style={{padding:"10px 12px 0"}}>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <button style={{...btn("primary","sm"),flex:1}} onClick={()=>setPanel("code")}>💻 Editor</button>
          <button style={{...btn("purple","sm"),flex:1}}>+ New Project</button>
          <button style={btn("ghost","sm")} onClick={()=>setIModal(true)}>⚙</button>
        </div>
        <div style={{...card(),padding:"10px 12px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>🐙</span><span style={{fontSize:13,fontWeight:700,flex:1}}>GitHub</span>{integr.github?<span style={tag(T.green)}>{integr.github}</span>:<span style={tag(T.muted)}>Not linked</span>}</div>
          {!integr.github&&<button style={{...btn("ghost","xs"),marginTop:8}} onClick={()=>setIModal(true)}>Connect →</button>}
        </div>
        {PROJS.map(pr=>(
          <div key={pr.id} style={{...card(),marginBottom:10}}>
            <div style={{padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.accent}}>{pr.name}</div><div style={{fontSize:11,color:T.dim,marginTop:2}}>{pr.desc}</div></div>
                <span style={{...tag(pr.status==="active"?T.green:T.muted),flexShrink:0,marginLeft:8}}>{pr.status}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
                <span style={tag(T.accent3)}>{pr.lang}</span><span style={{fontSize:11,color:T.muted}}>⭐ {pr.stars}</span><span style={{fontSize:11,color:T.muted}}>🍴 {pr.forks}</span><span style={{fontSize:11,color:T.muted}}>🕐 {pr.push} ago</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{display:"flex"}}>{pr.collab.map((a,i)=><div key={i} style={{marginLeft:i>0?-6:0}}><Av label={a} size={22}/></div>)}</div>
                <button style={{...btn("ghost","xs"),marginLeft:"auto"}} onClick={()=>setPanel("code")}>💻 Open</button>
                <button style={btn("purple","xs")} onClick={()=>setPanel("ai")}>🤖 AI</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>;
  };

  const ProfilePage=()=>{
    const myPosts=posts.filter(p=>p.isUser||p.av===user.av);
    const maxXP=Math.max(...xpHistory.map(d=>d.xp),1);
    return <>
      <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"sticky",top:0,zIndex:9}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:800,color:T.accent}}>{"<HN/>"}</span>
        <div style={{display:"flex",gap:4}}>
          <button style={btn("ghost","xs")} onClick={()=>setEditProfile(true)}>✏️ Edit</button>
          <button style={btn("ghost","sm")} onClick={()=>setPanel("groups")}>⊂⊃</button>
          <button style={btn("ghost","sm")} onClick={()=>setPanel("leaderboard")}>⊛</button>
          <button style={btn("ghost","sm")} onClick={exportData}>📤</button>
          <button style={btn("red","sm")} onClick={doLogout}>Logout</button>
        </div>
      </div>
      <div style={{height:90,background:`linear-gradient(135deg,${T.accent3}33,${T.accent}22)`,position:"relative",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{position:"absolute",bottom:-26,left:16}}><Av label={user.av} size={56} color={user.color} border={T.accent}/></div>
      </div>
      <div style={{padding:"30px 16px 0"}}>
        <div style={{fontSize:19,fontWeight:800}}>{user.name}</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{user.handle} · <span style={{color:T.accent}}>{user.level}</span></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}><RatingBadge r={rating}/>{user.badges?.map((b,i)=><span key={i} style={{fontSize:16}}>{b}</span>)}<span style={tag(T.warn)}>🔥 {user.streak||0}d</span><span style={tag(T.green)}>✅ {Object.keys(solved).length}</span></div>
        <div style={{fontSize:12,color:T.dim,marginBottom:12,lineHeight:1.6}}>{user.bio}</div>
        {/* Progress dashboard */}
        <div style={{...card(),padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:10}}>📊 XP THIS WEEK</div>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60,marginBottom:6}}>
            {xpHistory.slice(-7).map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",background:T.accent,borderRadius:"3px 3px 0 0",height:`${(d.xp/maxXP)*52}px`,transition:"height .3s",minHeight:4}}/>
                <span style={{fontSize:8,color:T.muted}}>{d.day.slice(0,2)}</span>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
            {[["Solved",Object.keys(solved).length,"🎯",T.green],["Rating",rating,"⭐",T.warn],["Messages",chatSentCount,"💬",T.accent],["Battles",battlesWon,"⚔️",T.accent3]].map(([l,v,ic,col])=>(
              <div key={l} style={{background:T.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${T.border}`}}><div style={{fontSize:15,fontWeight:800,color:col,fontFamily:"'JetBrains Mono',monospace"}}>{ic} {v}</div><div style={{fontSize:10,color:T.muted}}>{l}</div></div>
            ))}
          </div>
        </div>
        {/* Badges */}
        <div style={{...card(),padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>🏅 BADGES ({earnedBadges.length}/{BADGE_DEFS.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {BADGE_DEFS.map(b=><div key={b.id} style={{...tag(earnedBadges.includes(b.id)?T.warn:T.muted),padding:"4px 8px",borderRadius:8,opacity:earnedBadges.includes(b.id)?1:0.35,fontSize:10}} title={b.desc}>{b.icon} {b.name}</div>)}
          </div>
        </div>
        {/* Integrations */}
        <div style={{...card(),padding:"10px 12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>INTEGRATIONS</span><button style={btn("ghost","xs")} onClick={()=>setIModal(true)}>⚙ Manage</button></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["🐙","GitHub",integr.github],["🟠","LeetCode",integr.lc],["🔵","Codeforces",integr.cf],["🟤","CodeChef",integr.cc]].map(([ic,l,v])=><span key={l} style={{...tag(v?T.green:T.muted),fontSize:9}}>{ic} {v||`No ${l}`}</span>)}</div>
        </div>
        {/* Stats */}
        <div style={{display:"flex",gap:16,padding:"12px 0",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,marginBottom:12}}>
          {[["Posts",myPosts.length],["Followers",user.followers||0],["Following",following.length]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",flex:1}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:800}}>{v}</div><div style={{fontSize:10,color:T.muted}}>{l}</div></div>
          ))}
        </div>
        {/* Profile tabs */}
        <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:12}}>
          {["posts","bookmarks","solved","subs"].map(t=><button key={t} style={{flex:1,padding:"8px 0",fontSize:9,background:profTab===t?T.accent:T.card,color:profTab===t?"#000":T.muted,border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:profTab===t?700:400,transition:"all .15s",textTransform:"capitalize"}} onClick={()=>setProfTab(t)}>{t}</button>)}
        </div>
        {profTab==="posts"&&(myPosts.length===0?<div style={{textAlign:"center",color:T.muted,padding:24,fontSize:12}}>No posts yet 🚀</div>:myPosts.map(p=><PostCard key={p.id} p={p}/>))}
        {profTab==="bookmarks"&&(posts.filter(p=>bookmarked[p.id]).length===0?<div style={{textAlign:"center",color:T.muted,padding:24,fontSize:12}}>No bookmarks.</div>:posts.filter(p=>bookmarked[p.id]).map(p=><PostCard key={p.id} p={p}/>))}
        {profTab==="solved"&&(PROBLEMS.filter(p=>solved[p.id]).length===0?<div style={{textAlign:"center",color:T.muted,padding:24,fontSize:12}}>Solve some problems! 💪</div>:PROBLEMS.filter(p=>solved[p.id]).map(p=>(<div key={p.id} style={{...card(),marginBottom:8,cursor:"pointer"}} onClick={()=>openProb(p)}><div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}><span>✅</span><span style={{flex:1,fontSize:12,fontWeight:700}}>{p.title}</span><PBadge platform={p.platform} xs/></div></div>)))}
        {profTab==="subs"&&(subs.length===0?<div style={{textAlign:"center",color:T.muted,padding:24,fontSize:12}}>No submissions.</div>:subs.map((s,i)=>(<div key={i} style={{...card(),marginBottom:8}}><div style={{padding:"10px 12px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:s.status==="Accepted"?T.green:T.accent2}}>{s.status==="Accepted"?"✅ ":""}{s.status}</span><span style={{fontSize:10,color:T.muted}}>{s.time}</span></div><div style={{fontSize:11,color:T.dim}}>{s.problem}</div><div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}><PBadge platform={s.platform||"hackernet"} xs/><span style={{fontSize:10,color:T.muted}}>{s.lang} · {s.rt}</span>{s.pts&&<span style={{fontSize:10,color:T.warn}}>+{s.pts}pts</span>}</div></div></div>)))}
      </div>
    </>;
  };

  // ── PANELS ───────────────────────────────────────────────────

  // Real-time Chat Panel
  const ChatPanel=()=>{
    const pinnedForRoom=pinnedMsg[chatRoomId];
    const currentMsgs=allMessages[chatRoomId]||[];
    const typingInRoom=Object.values(typingUsers[chatRoomId]||{}).filter(t=>t.ts&&t.ts>Date.now()-4000);
    const filteredMsgs=showChatSearch&&chatSearch?currentMsgs.filter(m=>m.text?.toLowerCase().includes(chatSearch.toLowerCase())||m.authorName?.toLowerCase().includes(chatSearch.toLowerCase())):currentMsgs;
    const onlineList=Object.values(onlineUsers).filter(u=>u.userId!==user?.id);

    // Group messages
    const grouped=[];let lastDate=null;let lastAuthor=null;
    filteredMsgs.forEach((msg,i)=>{
      const d=new Date(msg.timestamp);
      const today=new Date();
      const dateStr=d.toDateString()===today.toDateString()?"Today":d.toLocaleDateString([],{month:"short",day:"numeric"});
      if(dateStr!==lastDate){grouped.push({type:"date",date:dateStr});lastDate=dateStr;lastAuthor=null;}
      const showH=msg.authorId!==lastAuthor||(i>0&&msg.timestamp-filteredMsgs[i-1]?.timestamp>300000);
      grouped.push({type:"msg",msg,showH});lastAuthor=msg.authorId;
    });

    return <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200}}>
      {/* Chat notification toast */}
      {chatNotif&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",zIndex:999,background:T.surface,border:`1px solid ${T.border}`,borderRadius:"0 0 12px 12px",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,maxWidth:"90%",boxShadow:"0 4px 20px #000a"}}><span style={{fontSize:13}}>💬</span><span style={{fontSize:11,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{chatNotif.text.slice(0,55)}{chatNotif.text.length>55?"…":""}</span></div>}

      {/* Topbar */}
      <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button style={ib()} onClick={()=>setPanel(null)}>←</button>
        {activeDM?(
          <>
            <Av label={dmTarget?.av||"?"} size={28} color={dmTarget?.color||T.accent}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,lineHeight:1}}>{dmTarget?.name}</div><div style={{fontSize:10,color:onlineList.find(u=>u.userId===dmTarget?.userId)?T.green:T.muted}}>{onlineList.find(u=>u.userId===dmTarget?.userId)?"● Online":"○ Offline"}</div></div>
            <button style={ib(false,T.accent2)} onClick={closeDM}>✕ DM</button>
          </>
        ):(
          <>
            <span style={{fontSize:14,color:T.accent,fontWeight:700,flex:1}}>{ROOMS.find(r=>r.id===activeRoom)?.name||"Chat"}</span>
          </>
        )}
        <button style={ib(showChatSearch,T.accent)} onClick={()=>setShowChatSearch(!showChatSearch)}>🔍</button>
        <button style={ib(chatPanel==="members")} onClick={()=>setChatPanel(p=>p==="members"?"rooms":"members")}>👥{onlineList.length>0&&<span style={{background:T.green,color:"#000",fontSize:9,fontWeight:800,borderRadius:8,padding:"1px 4px"}}>{onlineList.length}</span>}</button>
      </div>

      {/* Search */}
      {showChatSearch&&<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"6px 12px"}}><input style={{...inp,borderRadius:20,fontSize:12}} placeholder="Search messages…" value={chatSearch} onChange={e=>setChatSearch(e.target.value)} autoFocus/></div>}

      {/* Pinned */}
      {pinnedForRoom&&!activeDM&&<div style={{background:`${T.warn}18`,borderBottom:`1px solid ${T.warn}33`,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12}}>📌</span><span style={{fontSize:11,color:T.warn,fontFamily:"'JetBrains Mono',monospace",flex:1}}>{pinnedForRoom.authorName}: {pinnedForRoom.text?.slice(0,55)||"📎 Media"}</span><button style={ib()} onClick={()=>setPinnedMsg(p=>{const n={...p};delete n[chatRoomId];DB.set("rt_pin",n);return n;})}>✕</button></div>}

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* Sidebar */}
        {chatPanel!=="members"&&(
          <div style={{width:190,flexShrink:0,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
              {[["rooms","# Rooms"],["dms","💬 DMs"]].map(([id,lb])=><button key={id} style={{flex:1,padding:"7px 0",fontSize:10,background:"transparent",color:chatPanel===id?T.accent:T.muted,border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:chatPanel===id?700:400,borderBottom:`2px solid ${chatPanel===id?T.accent:"transparent"}`,transition:"all .15s"}} onClick={()=>setChatPanel(id)}>{lb}</button>)}
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {chatPanel==="rooms"&&ROOMS.map(r=>(
                <button key={r.id} onClick={()=>{setActiveRoom(r.id);setActiveDM(null);setDmTarget(null);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:activeRoom===r.id&&!activeDM?`${T.accent}18`:"transparent",border:"none",cursor:"pointer",color:activeRoom===r.id&&!activeDM?T.accent:T.dim,fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:activeRoom===r.id&&!activeDM?700:400,borderLeft:`3px solid ${activeRoom===r.id&&!activeDM?T.accent:"transparent"}`,transition:"all .12s",textAlign:"left"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{r.icon}</span>
                  <span style={{flex:1}}>{r.name}</span>
                  {unreadCounts[r.id]>0&&<span style={{background:T.accent2,color:"#fff",fontSize:9,fontWeight:800,borderRadius:8,padding:"1px 5px"}}>{unreadCounts[r.id]}</span>}
                </button>
              ))}
              {chatPanel==="dms"&&(
                onlineList.length===0
                  ?<div style={{padding:"16px 12px",fontSize:11,color:T.muted,textAlign:"center"}}>Open another tab!<br/>Login different account.</div>
                  :onlineList.map(u=>{
                    const dmId=getDMId(user.id,u.userId);
                    return <button key={u.userId} onClick={()=>openDM(u)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:activeDM===dmId?`${T.accent}18`:"transparent",border:"none",cursor:"pointer",borderLeft:`3px solid ${activeDM===dmId?T.accent:"transparent"}`,transition:"all .12s"}}>
                      <div style={{position:"relative"}}><Av label={u.av} size={28} color={u.color}/><div style={{position:"absolute",bottom:0,right:0,width:8,height:8,borderRadius:"50%",background:T.green,border:`2px solid ${T.surface}`}}/></div>
                      <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:11,fontWeight:600,color:activeDM===dmId?T.accent:T.text}}>{u.name}</div><div style={{fontSize:9,color:T.muted}}>{u.handle}</div></div>
                      {unreadCounts[dmId]>0&&<span style={{background:T.accent2,color:"#fff",fontSize:9,fontWeight:800,borderRadius:8,padding:"1px 5px"}}>{unreadCounts[dmId]}</span>}
                    </button>;
                  })
              )}
            </div>
            <div style={{padding:"8px 12px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
              <Av label={user.av} size={28} color={user.color}/>
              <div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:11,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><div style={{fontSize:9,color:T.green}}>● Online</div></div>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
            {filteredMsgs.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:T.muted}}><div style={{fontSize:28,marginBottom:8}}>{ROOMS.find(r=>r.id===activeRoom)?.icon||"💬"}</div><div style={{fontSize:13,fontWeight:700,color:T.dim,marginBottom:4}}>{activeDM?`DM with ${dmTarget?.name}`:`Welcome to ${ROOMS.find(r=>r.id===activeRoom)?.name||"Chat"}`}</div><div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",marginTop:8,color:T.muted}}>💡 Open in 2+ tabs for real-time chat!</div></div>}

            {grouped.map((item,i)=>{
              if(item.type==="date")return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>{item.date}</span><div style={{flex:1,height:1,background:T.border}}/></div>;
              const{msg,showH}=item;
              const isMe=msg.authorId===user.id;
              const msgReacts=reactions[msg.id]||{};
              const isEditing=editingMsg===msg.id;
              const isMenu=msgMenuId===msg.id;
              return <div key={msg.id} style={{padding:showH?"8px 14px 2px":"2px 14px",display:"flex",gap:10,position:"relative",background:isMenu?`${T.accent}06`:"transparent"}} className="msg-item">
                <div style={{width:36,flexShrink:0}}>{showH&&<Av label={msg.authorAv} size={34} color={msg.authorColor}/>}</div>
                <div style={{flex:1,minWidth:0}}>
                  {showH&&<div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:msg.authorColor}}>{msg.authorName}</span>
                    <span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{msg.authorHandle}</span>
                    <span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{new Date(msg.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  </div>}
                  {msg.replyTo&&!msg.deleted&&<div style={{background:`${T.border}66`,borderLeft:`3px solid ${T.accent}`,borderRadius:"0 6px 6px 0",padding:"3px 8px",marginBottom:4,fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>↩ {msg.replyTo.author}: {msg.replyTo.text?.slice(0,40)||"📎"}</div>}
                  {msg.deleted?<div style={{fontSize:12,color:T.muted,fontStyle:"italic",fontFamily:"'JetBrains Mono',monospace"}}>🗑 Message deleted</div>
                  :isEditing?<div style={{display:"flex",gap:6}}><input style={{...inp,flex:1,fontSize:13,padding:"6px 10px"}} value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape"){setEditingMsg(null);setEditText("");}}} autoFocus/><button style={{...btn("primary","xs")}} onClick={saveEdit}>✓</button><button style={{...btn("ghost","xs")}} onClick={()=>{setEditingMsg(null);setEditText("");}}>✕</button></div>
                  :<>
                    {msg.media&&<div style={{marginBottom:msg.text?6:0}}><img src={msg.media} alt="" style={{maxWidth:"min(320px,78%)",maxHeight:280,borderRadius:10,cursor:"zoom-in",display:"block",border:`1px solid ${T.border}`}} onClick={()=>setMediaModal(msg.media)}/></div>}
                    {msg.text&&<div style={{fontSize:13,lineHeight:1.6,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}{msg.edited&&<span style={{fontSize:10,color:T.muted,marginLeft:6,fontFamily:"'JetBrains Mono',monospace"}}>(edited)</span>}</div>}
                  </>}
                  {Object.keys(msgReacts).length>0&&!msg.deleted&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                    {Object.entries(msgReacts).filter(([,ids])=>ids.length>0).map(([emoji,ids])=>(
                      <button key={emoji} onClick={()=>sendReaction(msg.id,emoji)} style={{background:ids.includes(user.id)?`${T.accent}22`:`${T.border}66`,border:`1px solid ${ids.includes(user.id)?T.accent+"44":T.border}`,borderRadius:12,padding:"2px 8px",fontSize:12,cursor:"pointer",color:T.text,display:"flex",alignItems:"center",gap:3}}>
                        {emoji}<span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:ids.includes(user.id)?T.accent:T.muted}}>{ids.length}</span>
                      </button>
                    ))}
                  </div>}
                </div>
                {/* hover actions */}
                {!msg.deleted&&<div className="msg-actions" style={{position:"absolute",right:14,top:showH?8:2,opacity:0,transition:"opacity .15s",display:"flex",gap:2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"2px"}}>
                  {EMOJI_REACTS.slice(0,3).map(em=><button key={em} style={{...ib(),padding:"3px 5px",fontSize:13}} onClick={()=>sendReaction(msg.id,em)}>{em}</button>)}
                  <button style={{...ib(),padding:"3px 5px",fontSize:12,color:T.dim}} onClick={()=>setReplyTo(msg)}>↩</button>
                  {isMe&&<button style={{...ib(),padding:"3px 5px",fontSize:12,color:T.dim}} onClick={()=>{setEditingMsg(msg.id);setEditText(msg.text);}}>✏️</button>}
                  <button style={{...ib(),padding:"3px 5px",fontSize:12}} onClick={()=>setMsgMenuId(isMenu?null:msg.id)}>⋮</button>
                </div>}
                {/* menu */}
                {isMenu&&!msg.deleted&&<div style={{position:"absolute",right:14,top:36,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,zIndex:50,overflow:"hidden",boxShadow:"0 4px 20px #000a",minWidth:160}}>
                  <div style={{padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:2}}>{EMOJI_REACTS.map(em=><span key={em} style={{fontSize:18,cursor:"pointer",padding:"2px"}} onClick={()=>{sendReaction(msg.id,em);setMsgMenuId(null);}}>{em}</span>)}</div>
                  <div style={{borderTop:`1px solid ${T.border}`}}>
                    {[["↩ Reply",()=>{setReplyTo(msg);setMsgMenuId(null);},T.text],[isMe&&"✏️ Edit",isMe&&(()=>{setEditingMsg(msg.id);setEditText(msg.text);setMsgMenuId(null);}),T.text],[!activeDM&&"📌 Pin",!activeDM&&(()=>pinChatMsg(msg)),T.warn],[isMe&&"🗑 Delete",isMe&&(()=>deleteChatMsg(msg.id)),T.accent2],["📋 Copy",()=>{navigator.clipboard?.writeText(msg.text||"");setMsgMenuId(null);},T.dim]].filter(Boolean).filter(x=>x[0]).map(([label,action,color])=>(
                      <button key={label} style={{width:"100%",padding:"8px 14px",textAlign:"left",background:"transparent",border:"none",color,fontSize:12,cursor:"pointer",fontFamily:"'Syne',sans-serif"}} onClick={action}>{label}</button>
                    ))}
                  </div>
                </div>}
              </div>;
            })}

            {/* Typing indicator */}
            {typingInRoom.length>0&&<div style={{padding:"4px 14px 8px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:34}}/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,opacity:.5,animation:`pulse .6s ${i*.2}s infinite alternate`}}/>)}
                <span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginLeft:4}}>{typingInRoom.slice(0,3).map(t=>t.name).join(", ")} typing…</span>
              </div>
            </div>}
            <div ref={chatEndRef}/>
          </div>

          {/* Input area */}
          <div style={{borderTop:`1px solid ${T.border}`,background:T.surface,padding:"8px 12px",flexShrink:0}}>
            {replyTo&&<div style={{background:`${T.border}66`,borderLeft:`3px solid ${T.accent}`,borderRadius:"0 8px 8px 0",padding:"5px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",flex:1}}>↩ {replyTo.authorName}: {replyTo.text?.slice(0,40)||"📎"}…</span><button style={ib()} onClick={()=>setReplyTo(null)}>✕</button></div>}
            {chatMedia&&<div style={{marginBottom:8}}><div style={{position:"relative",display:"inline-block"}}><img src={chatMedia} alt="" style={{maxHeight:100,maxWidth:"100%",borderRadius:8,display:"block",border:`1px solid ${T.border}`}}/><button style={{position:"absolute",top:4,right:4,background:"#000000aa",border:"none",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:12}} onClick={()=>{setChatMedia(null);setChatCaption("");}}>✕</button></div><input style={{...inp,marginTop:6,fontSize:11}} placeholder="Add caption…" value={chatCaption} onChange={e=>setChatCaption(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChatMsg()}/></div>}
            <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
              <input ref={chatFileRef} type="file" accept="image/*,video/*,.gif" style={{display:"none"}} onChange={handleChatFile}/>
              <button style={{...ib(),flexShrink:0,fontSize:18}} onClick={()=>chatFileRef.current?.click()}>📎</button>
              <button style={{...ib(),flexShrink:0,fontSize:18}} onClick={()=>chatFileRef.current?.click()}>🖼</button>
              <textarea style={{...inp,flex:1,borderRadius:12,padding:"8px 12px",resize:"none",minHeight:38,maxHeight:100,lineHeight:1.5,fontFamily:"'Syne',sans-serif",fontSize:13}} placeholder={`Message ${activeDM?dmTarget?.name:(ROOMS.find(r=>r.id===activeRoom)?.name||"")}`} value={chatInput} onChange={handleChatTyping} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMsg();}}} rows={1}/>
              <button style={{...btn("primary"),width:38,height:38,padding:0,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}} onClick={sendChatMsg}>↑</button>
            </div>
            <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>Enter = send · Shift+Enter = newline · 📎/🖼 = image</div>
          </div>
        </div>

        {/* Members panel */}
        {chatPanel==="members"&&<div style={{width:190,flexShrink:0,background:T.surface,borderLeft:`1px solid ${T.border}`,overflowY:"auto"}}>
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>ONLINE — {Object.values(onlineUsers).length+1}</div></div>
          <div style={{padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{position:"relative"}}><Av label={user.av} size={30} color={user.color}/><div style={{position:"absolute",bottom:0,right:0,width:8,height:8,borderRadius:"50%",background:T.green,border:`2px solid ${T.surface}`}}/></div>
            <div><div style={{fontSize:12,fontWeight:700,color:user.color}}>{user.name} <span style={{color:T.muted,fontSize:10}}>(You)</span></div><div style={{fontSize:10,color:T.green}}>● Online</div></div>
          </div>
          {Object.values(onlineUsers).map(u=>(
            <div key={u.userId} style={{padding:"8px 12px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>openDM(u)}>
              <div style={{position:"relative"}}><Av label={u.av} size={30} color={u.color}/><div style={{position:"absolute",bottom:0,right:0,width:8,height:8,borderRadius:"50%",background:T.green,border:`2px solid ${T.surface}`}}/></div>
              <div><div style={{fontSize:12,fontWeight:600,color:u.color}}>{u.name}</div><div style={{fontSize:10,color:T.muted}}>{u.handle}</div></div>
            </div>
          ))}
          {Object.values(onlineUsers).length===0&&<div style={{padding:"16px 12px",fontSize:11,color:T.muted,textAlign:"center",lineHeight:1.6}}>Open another tab and login a different account!</div>}
        </div>}
      </div>
    </div>;
  };

  // Problem Panel
  const ProblemPanel=()=>{
    if(!prob)return null;
    const pm=PM[prob.platform]||PM.hackernet;
    const changeLang=(l)=>{setPLang(l);const s=DB.get(`${uid}_pc_${prob.id}_${l}`,prob.starter?.[l]||"");setPCode(s);};
    return <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
      <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",gap:8,flexShrink:0,position:"sticky",top:0,zIndex:10}}>
        <button style={ib()} onClick={()=>setPanel(null)}>←</button>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{prob.title}</div><div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}><PBadge platform={prob.platform} xs/><span style={tag(prob.diff==="Easy"?T.green:prob.diff==="Medium"?T.warn:T.accent2)}>{prob.diff}</span>{solved[prob.id]&&<span style={tag(T.green)}>✅</span>}{prob.id===DAILY_PROB.id&&<span style={tag(T.warn)}>🎯 Daily</span>}</div></div>
        <button style={ib()} onClick={()=>setPanel("ai")}>🤖</button>
        {prob.platform!=="hackernet"&&<a href={prob.platform==="leetcode"?`https://leetcode.com/problems/${prob.lcSlug}/`:prob.platform==="codeforces"?"https://codeforces.com/problemset":"https://www.codechef.com/"} target="_blank" rel="noreferrer" style={{...btn("ghost","xs"),textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>↗ {pm.label}</a>}
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0,position:"sticky",top:55,zIndex:9}}>
        {["desc","solution","subs","tests"].map(t=><button key={t} style={{flex:1,padding:"9px 0",fontSize:10,background:"transparent",color:pTab===t?T.accent:T.muted,border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:pTab===t?700:400,borderBottom:`2px solid ${pTab===t?T.accent:"transparent"}`,transition:"all .15s"}} onClick={()=>setPTab(t)}>{t==="desc"?"📄 Desc":t==="solution"?"💡 Sol":t==="subs"?"📊 Subs":"🧪 Tests"}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {pTab==="desc"&&<div style={{padding:"12px 14px"}}>
          <div style={{background:`${pm.color}15`,border:`1px solid ${pm.color}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}><div style={{fontSize:11,color:T.dim}}>{pm.icon} From <b style={{color:pm.color}}>{pm.label}</b>. Submit here → get direct link.</div></div>
          <p style={{fontSize:13,lineHeight:1.8,whiteSpace:"pre-line",marginBottom:14}}>{prob.desc}</p>
          {prob.examples.map((ex,i)=><div key={i} style={{background:T.codeBg,border:`1px solid ${T.border}`,borderRadius:8,padding:10,marginBottom:10}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Example {i+1}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.green,marginBottom:2}}>Input: {ex.in}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>Output: {ex.out}</div>
            {ex.exp&&<div style={{fontSize:11,color:T.dim,marginTop:4}}>Explanation: {ex.exp}</div>}
          </div>)}
          <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:6}}>CONSTRAINTS</div>
          {prob.constraints.map((c,i)=><div key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.dim,marginBottom:4}}>• {c}</div>)}
          {prob.companies?.length>0&&<div style={{marginTop:12}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:6}}>ASKED BY</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{prob.companies.map(c=><span key={c} style={tag(T.dim)}>{c}</span>)}</div></div>}
          <div style={{height:16}}/>
        </div>}
        {pTab==="solution"&&<div style={{padding:"12px 14px"}}>
          <SyntaxCode code={"// Optimal O(n) Time, O(n) Space\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n}"} lang="js"/>
          <p style={{fontSize:12,color:T.dim,lineHeight:1.7,marginTop:12}}><b style={{color:T.accent}}>Key:</b> HashMap stores index of complement. One pass O(n).</p>
        </div>}
        {pTab==="subs"&&<div style={{padding:"12px 14px"}}>
          {subs.filter(s=>s.problem===prob.title).length===0?<div style={{textAlign:"center",color:T.muted,padding:32,fontSize:12}}>No submissions yet.</div>
          :subs.filter(s=>s.problem===prob.title).map((s,i)=><div key={i} style={{...card(),padding:"10px 12px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:s.status==="Accepted"?T.green:T.accent2}}>{s.status==="Accepted"?"✅ ":""}{s.status}</span><span style={{fontSize:10,color:T.muted}}>{s.time}</span></div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{s.lang} · {s.rt}</div></div>)}
        </div>}
        {pTab==="tests"&&<div style={{padding:"12px 14px"}}>
          <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>🧪 CUSTOM TEST CASES</div>
          {customTests.map((tc,i)=><div key={i} style={{...card(),padding:"10px 12px",marginBottom:8}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4}}>Test {i+1}</div>
            <div style={{marginBottom:6}}><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Input</div><textarea style={{...inp,fontSize:11,fontFamily:"'JetBrains Mono',monospace",minHeight:36,resize:"none"}} value={tc.i} onChange={e=>setCustomTests(p=>p.map((t,j)=>j===i?{...t,i:e.target.value}:t))} placeholder="Your input…"/></div>
            <div><div style={{fontSize:10,color:T.muted,marginBottom:2}}>Expected</div><input style={{...inp,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}} value={tc.e} onChange={e=>setCustomTests(p=>p.map((t,j)=>j===i?{...t,e:e.target.value}:t))} placeholder="Expected output…"/></div>
          </div>)}
          <button style={btn("ghost","sm")} onClick={()=>setCustomTests(p=>[...p,{i:"",e:""}])}>+ Add Test</button>
        </div>}
        {(pAiReview||pAiLoading)&&<div style={{padding:"0 14px 14px"}}><div style={{background:`${T.accent3}15`,border:`1px solid ${T.accent3}44`,borderRadius:10,padding:12}}><div style={{fontSize:11,color:T.accent3,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>🤖 AI CODE REVIEW</div><div style={{fontSize:11,color:T.text,whiteSpace:"pre-wrap",lineHeight:1.6}}>{pAiLoading?"Reviewing your code…":pAiReview}</div></div></div>}
        {/* Editor */}
        <div style={{borderTop:`1px solid ${T.border}`,background:T.surface,flexShrink:0}}>
          <div style={{display:"flex",gap:4,padding:"6px 10px",overflowX:"auto",scrollbarWidth:"none"}}>
            {["js","py","cpp","java"].map(l=><button key={l} style={{...btn(pLang===l?"primary":"ghost","xs"),flexShrink:0}} onClick={()=>changeLang(l)}>{LM[l]?.name}</button>)}
            <span style={{marginLeft:"auto",fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace",alignSelf:"center"}}>auto-saved</span>
          </div>
          <textarea style={{width:"100%",height:150,background:T.codeBg,border:"none",borderTop:`1px solid ${T.border}`,padding:10,color:T.codeText,fontFamily:"'JetBrains Mono',monospace",fontSize:11,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.7}} value={pCode} onChange={e=>setPCode(e.target.value)} spellCheck={false} placeholder={prob.starter?.[pLang]||"// write your solution…"}/>
          {pOut&&<div style={{background:"#03070b",borderTop:`1px solid ${T.border}`,padding:10,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#7ec8e3",whiteSpace:"pre-wrap",maxHeight:120,overflowY:"auto",lineHeight:1.6}}>{pOut}</div>}
          <div style={{display:"flex",gap:6,padding:"8px 10px",borderTop:`1px solid ${T.border}`}}>
            <button style={btn("ghost","sm")} onClick={()=>runProb(false)} disabled={pRunning}>{pRunning?"⏳":"▶ Run"}</button>
            <button style={{...btn("green","sm"),flex:1}} onClick={()=>runProb(true)} disabled={pRunning}>✓ Submit {prob.platform!=="hackernet"?`→ ${pm.label}`:""}</button>
            <button style={btn("purple","sm")} onClick={()=>runAiReview(pCode,LM[pLang]?.name||pLang)}>🤖</button>
          </div>
        </div>
      </div>
    </div>;
  };

  // Code Editor Panel
  const CodePanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200}}>
    <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <button style={ib()} onClick={()=>setPanel(null)}>←</button>
      <span style={{flex:1,fontSize:13,fontWeight:700}}>⟩_ Code Editor (Real Compiler)</span>
      <button style={btn("purple","sm")} onClick={()=>setPanel("ai")}>🤖 AI</button>
    </div>
    <div style={{display:"flex",gap:4,padding:"8px 10px",background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {Object.entries(LM).map(([k,lm])=><button key={k} style={{...btn(eLang===k?"primary":"ghost","xs"),flexShrink:0,color:eLang===k?"#000":lm.color,borderColor:lm.color+"44"}} onClick={()=>{setELang(k);setECode(EC[k]||"// write code…");setEOut("");setETab("editor");}}>
        {lm.name}
      </button>)}
    </div>
    <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0}}>
      {["editor","output"].map(t=><button key={t} style={{padding:"7px 16px",fontSize:11,background:"transparent",color:eTab===t?T.accent:T.muted,border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:eTab===t?700:400,borderBottom:`2px solid ${eTab===t?T.accent:"transparent"}`,transition:"all .15s"}} onClick={()=>setETab(t)}>{t==="editor"?"📝 Editor":"📤 Output"}</button>)}
      <span style={{marginLeft:"auto",padding:"8px 10px",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{LM[eLang]?.name} · Piston API</span>
    </div>
    <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      {eTab==="editor"?<div style={{flex:1,background:T.codeBg,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",gap:5,padding:"6px 12px",borderBottom:`1px solid ${T.border}22`}}>{["#ff5f56","#ffbd2e","#27c93f"].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}<span style={{marginLeft:8,fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>solution.{LM[eLang]?.ext}</span></div>
        <textarea style={{flex:1,background:T.codeBg,border:"none",padding:"12px 14px",color:T.codeText,fontFamily:"'JetBrains Mono',monospace",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.8}} value={eCode} onChange={e=>setECode(e.target.value)} spellCheck={false}/>
      </div>:<div style={{flex:1,background:"#030709",padding:14,overflowY:"auto"}}>
        {eOut?<pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#7ec8e3",whiteSpace:"pre-wrap",lineHeight:1.7,margin:0}}>{eOut}</pre>:<div style={{textAlign:"center",color:T.muted,padding:32,fontSize:12}}>Run your code to see output (uses Piston API)</div>}
        {eAiReview&&<div style={{marginTop:16,background:`${T.accent3}15`,border:`1px solid ${T.accent3}44`,borderRadius:10,padding:12}}><div style={{fontSize:11,color:T.accent3,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>🤖 AI REVIEW</div><div style={{fontSize:11,color:T.text,whiteSpace:"pre-wrap",lineHeight:1.6}}>{eAiReview}</div></div>}
      </div>}
    </div>
    <div style={{display:"flex",gap:6,padding:"8px 10px",background:T.surface,borderTop:`1px solid ${T.border}`,flexShrink:0}}>
      <button style={{...btn("ghost","sm"),flex:1}} onClick={runEditor} disabled={eRunning}>{eRunning?"⏳ Running…":"▶ Run (Real)"}</button>
      <button style={{...btn("primary","sm"),flex:1}} onClick={()=>setETab("output")}>📤 Output</button>
      <button style={btn()} onClick={()=>{setPosts(p=>[{id:`p${Date.now()}`,av:user.av,color:user.color,user:user.name,handle:user.handle,time:"now",type:"code",content:`My ${LM[eLang]?.name} solution 🔥`,code:eCode,lang:LM[eLang]?.name,likes:0,comments:0,shares:0,tags:[`#${eLang}`],commentList:[],isUser:true},...p]);setPanel(null);setScreen("feed");}}>↗ Post</button>
    </div>
  </div>;

  // Battle Panel
  const BattlePanel=()=>{
    if(!battleState)return null;
    const isDone=battleState.status==="done";
    const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
    return <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200}}>
      <div style={{background:`${T.surface}f0`,borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button style={ib()} onClick={()=>setPanel(null)}>←</button>
        <span style={{flex:1,fontSize:14,fontWeight:700}}>⚔️ 1v1 Battle</span>
        {!isDone&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:800,color:T.accent}}>{fmt(battleTimer)}</span>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {[[user,"You",true],[battleState.opp,"Opponent",false]].map(([u,label,isMe])=>(
            <div key={label} style={{flex:1,...card(),padding:"12px",textAlign:"center"}}>
              <Av label={u.av||u.av} size={40} color={u.color||T.accent}/>
              <div style={{fontSize:12,fontWeight:700,marginTop:6}}>{u.name||u.name}</div>
              <div style={{fontSize:11,color:T.muted}}>{label}</div>
              {isDone&&<div style={{fontSize:24,marginTop:4}}>{isMe?(battleState.won?"🥇":"🥈"):(battleState.won?"🥈":"🥇")}</div>}
            </div>
          ))}
        </div>
        {isDone?<div style={{...card(),padding:"20px",textAlign:"center",borderColor:(battleState.won?T.green:T.accent2)+"55"}}>
          <div style={{fontSize:40,marginBottom:8}}>{battleState.won?"🏆":"💀"}</div>
          <div style={{fontSize:18,fontWeight:800,color:battleState.won?T.green:T.accent2,marginBottom:4}}>{battleState.won?"YOU WIN!":"YOU LOST"}</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:12}}>Your time: {fmt(battleState.myTime)} · Their time: {fmt(battleState.theirTime)}</div>
          <div style={{fontSize:14,fontWeight:700,color:battleState.won?T.green:T.accent2}}>{battleState.won?"+25 Rating":"-10 Rating"}</div>
          <button style={{...btn("primary"),marginTop:16}} onClick={()=>{setPanel(null);setBattleState(null);}}>Back</button>
        </div>:<>
          <div style={{...card(),padding:"12px",marginBottom:12}}>
            <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:4}}>PROBLEM</div>
            <div style={{fontSize:14,fontWeight:700}}>{battleState.problem.title}</div>
            <p style={{fontSize:12,lineHeight:1.6,marginTop:6,color:T.dim}}>{battleState.problem.desc}</p>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:8}}>{["js","py","cpp"].map(l=><button key={l} style={btn(pLang===l?"primary":"ghost","xs")} onClick={()=>setPLang(l)}>{LM[l]?.name}</button>)}</div>
          <textarea style={{width:"100%",height:150,background:T.codeBg,border:`1px solid ${T.border}`,borderRadius:10,padding:12,color:T.codeText,fontFamily:"'JetBrains Mono',monospace",fontSize:11,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.7,marginBottom:10}} value={pCode} onChange={e=>setPCode(e.target.value)} spellCheck={false} placeholder={battleState.problem.starter?.[pLang]||"// solve as fast as you can!"}/>
          <div style={{display:"flex",gap:6}}>
            <button style={{...btn("green"),flex:1}} onClick={submitBattle}>⚡ Submit Solution</button>
            <button style={btn("ghost","sm")} onClick={()=>setPanel("ai")}>🤖 Hint</button>
          </div>
          <div style={{marginTop:12,padding:10,...card(),borderColor:T.accent2+"44"}}>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:4}}>OPPONENT PROGRESS</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:`${Math.min((battleTimer/battleState.theirTime)*100,95)}%`,height:4,background:T.accent2,borderRadius:2,transition:"width .3s"}}/><span style={{fontSize:10,color:T.muted}}>{Math.min(Math.floor((battleTimer/battleState.theirTime)*100),95)}%</span></div>
          </div>
        </>}
      </div>
    </div>;
  };

  // AI Panel
  const AIPanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200}}>
    <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"9px 14px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      <button style={ib()} onClick={()=>setPanel(null)}>←</button>
      <div style={{width:32,height:32,borderRadius:"50%",background:`${T.accent}22`,border:`1px solid ${T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
      <div style={{flex:1,marginLeft:8}}><div style={{fontSize:13,fontWeight:700,color:T.accent}}>HackerAI</div><div style={{fontSize:10,color:T.muted}}>Claude-powered</div></div>
      <button style={btn("ghost","xs")} onClick={()=>setAiMsgs([{r:"ai",t:"Chat cleared. How can I help?"}])}>Clear</button>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
      {aiMsgs.map((m,i)=>(
        <div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:6}}>
          {m.r!=="user"&&<div style={{width:28,height:28,borderRadius:"50%",background:`${T.accent}22`,border:`1px solid ${T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🤖</div>}
          <div style={{background:m.r==="user"?T.accent3:"#0c1822",color:m.r==="user"?"#fff":T.text,borderRadius:12,padding:"9px 12px",fontSize:11,maxWidth:"88%",lineHeight:1.6,fontFamily:m.r!=="user"?"'JetBrains Mono',monospace":"'Syne',sans-serif",border:m.r!=="user"?`1px solid ${T.border}`:"none",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.t}</div>
        </div>
      ))}
      {aiLoad&&<div style={{display:"flex",gap:4,padding:"10px 12px",background:"#0c1822",borderRadius:12,width:"fit-content",border:`1px solid ${T.border}`}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:`pulse .6s ${i*.2}s infinite alternate`}}/>)}</div>}
      {aiMsgs.length<=1&&<div style={{marginTop:8}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:8}}>QUICK ACTIONS</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Debug my code","Explain Big O","CTF help","Code review","DP approach","Rust vs C++","Best DSA resources"].map(q=><button key={q} style={{...tag(T.accent3),cursor:"pointer",padding:"5px 10px",fontSize:11,borderRadius:8}} onClick={()=>setAiIn(q)}>{q}</button>)}</div></div>}
      <div ref={aiEndRef}/>
    </div>
    <div style={{padding:"8px 10px",borderTop:`1px solid ${T.border}`,display:"flex",gap:6,background:T.surface,flexShrink:0}}>
      <input style={{...inp,borderRadius:20,flex:1}} placeholder="Ask HackerAI anything…" value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()}/>
      <button style={{...btn("purple"),width:38,height:38,padding:0,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}} onClick={askAI} disabled={aiLoad}>↑</button>
    </div>
  </div>;

  // Other simple panels
  const NotifsPanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
    <Topbar title="🔔 Notifications" back={()=>setPanel(null)} noIcons/>
    <div style={{padding:"10px 12px"}}>
      {[{icon:"❤️",t:"0xRoot liked your post",sub:"2 min ago",read:false},{icon:"⚡",t:"AlgoBlitz Round 47 is LIVE",sub:"Contest started!",read:false},{icon:"💬",t:"ByteWitch: 'borrow checker disagrees'",sub:"1h ago",read:false},{icon:"🏆",t:"You ranked #4 globally",sub:"Up 3 spots!",read:true},{icon:"🎯",t:"Daily challenge available",sub:DAILY_PROB.title,read:true},{icon:"⚔️",t:"New 1v1 battle challenge",sub:"Check Problems tab",read:false},{icon:"🏅",t:"Badge progress: 3 more left!",sub:"Keep solving to earn all badges",read:true}].map((n,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"12px 10px",background:n.read?"transparent":`${T.accent}08`,borderRadius:10,marginBottom:4,border:`1px solid ${n.read?"transparent":T.accent+"22"}`}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:T.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:n.read?400:700,color:n.read?T.dim:T.text}}>{n.t}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>{n.sub}</div></div>
          {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:T.accent,marginTop:4,flexShrink:0}}/>}
        </div>
      ))}
    </div>
  </div>;

  const StoryPanel=()=>{
    if(!storyData)return null;
    return <div style={{position:"fixed",inset:0,background:`linear-gradient(180deg,#000 0%,${storyData.storyColor||storyData.color}22 50%,#000 100%)`,zIndex:300,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"46px 14px 10px"}}>
        <div style={{height:3,background:"#ffffff22",borderRadius:2,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${storyProg}%`,background:storyData.storyColor||storyData.color,transition:"none"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Av label={storyData.av} size={36} color={storyData.color} border={storyData.storyColor||storyData.color}/>
          <span style={{fontWeight:700,color:"#fff"}}>{storyData.name}</span>
          <button style={{...ib(),marginLeft:"auto",color:"#fff"}} onClick={()=>{setPanel(null);setStoryData(null);}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:"0 20px"}}>
        <div style={{fontSize:72}}>{storyData.icon||"💻"}</div>
        <div style={{background:"#00000066",borderRadius:10,padding:"12px 20px",border:`1px solid ${(storyData.storyColor||storyData.color)}44`,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:storyData.storyColor||storyData.color,textAlign:"center",lineHeight:1.6}}>{storyData.q}</div>
      </div>
      <div style={{padding:"0 14px 30px",display:"flex",gap:8}}>
        <input style={{...inp,borderRadius:20,flex:1,background:"#00000066"}} placeholder="Reply…"/>
        <button style={{...btn("primary"),borderRadius:"50%",width:40,height:40,padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
    </div>;
  };

  const ComposePanel=()=>(
    <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:T.surface,borderRadius:"20px 20px 0 0",padding:16,border:`1px solid ${T.border}`,maxHeight:"80dvh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Av label={user.av} size={32} color={user.color}/><div><div style={{fontSize:13,fontWeight:700}}>{user.name}</div><div style={{fontSize:10,color:T.muted}}>Public post</div></div></div>
          <button style={ib()} onClick={()=>{setPanel(null);setPostImg(null);}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>{["text","code","media"].map(t=><button key={t} style={{...btn(postType===t?"primary":"ghost","sm"),flex:1}} onClick={()=>setPostType(t)}>{t==="text"?"📝":t==="code"?"💻":"🖼"} {t}</button>)}</div>
        <textarea style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:10,color:T.text,fontFamily:postType==="code"?"'JetBrains Mono',monospace":"'Syne',sans-serif",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",minHeight:80,lineHeight:1.6}} placeholder={postType==="code"?"// paste your code…":"What's on your mind, hacker?"} value={postText} onChange={e=>setPostText(e.target.value)}/>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPostImg(ev.target.result);r.readAsDataURL(f);}}/>
        <div style={{display:"flex",gap:6,marginTop:8,alignItems:"center"}}>
          <button style={ib()} onClick={()=>fileInputRef.current?.click()}>🖼 Photo</button>
          {postImg&&<span style={{fontSize:11,color:T.green}}>✅ Image attached</span>}
          {postImg&&<button style={ib(false,T.accent2)} onClick={()=>setPostImg(null)}>✕</button>}
        </div>
        {postImg&&<img src={postImg} alt="" style={{width:"100%",borderRadius:8,marginTop:8,maxHeight:150,objectFit:"cover"}}/>}
        <div style={{display:"flex",gap:8,marginTop:10}}><button style={{...btn("primary"),flex:1}} onClick={submitPost}>Post</button><button style={btn("ghost")} onClick={()=>{setPanel(null);setPostImg(null);}}>Cancel</button></div>
      </div>
    </div>
  );

  const GroupsPanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
    <Topbar title="⊂⊃ Groups" back={()=>setPanel(null)} noIcons/>
    <div style={{padding:"10px 12px"}}><button style={{...btn("primary"),width:"100%",marginBottom:12}}>+ Create Group</button>
      {GROUPS.map(g=><div key={g.id} style={{...card(),marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10,padding:"12px"}}>
        <div style={{fontSize:28,width:46,height:46,borderRadius:12,background:`${T.accent3}22`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${T.accent3}33`}}>{g.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:T.dim}}>{g.desc}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>👥 {g.members.toLocaleString()}</div></div>
        <button style={{...btn(groups[g.id]?"ghost":"primary","sm"),flexShrink:0}} onClick={()=>setGroups(p=>({...p,[g.id]:!p[g.id]}))}>{groups[g.id]?"✓ Joined":"Join"}</button>
      </div></div>)}
    </div>
  </div>;

  const LeaderboardPanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
    <Topbar title="⊛ Leaderboard" back={()=>setPanel(null)} noIcons/>
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:6,padding:"16px 12px 8px"}}>
      {[[LB[1],120,2],[LB[0],150,1],[LB[2],100,3]].map(([u,ht,pos])=>(
        <div key={pos} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:20}}>{u.badge}</span>
          <Av label={u.av} size={36} color={u.color} border={pos===1?T.warn:null}/>
          <span style={{fontSize:9,fontWeight:700,color:pos===1?T.warn:T.text,maxWidth:70,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</span>
          <RatingBadge r={u.rating}/>
          <div style={{width:"100%",height:ht,background:pos===1?`${T.warn}22`:T.card,border:`1px solid ${pos===1?T.warn+"44":T.border}`,borderRadius:"6px 6px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:12,color:pos===1?T.warn:T.muted}}>#{pos}</span></div>
        </div>
      ))}
    </div>
    <div style={{padding:"0 12px"}}>
      {LB.map((u,i)=><div key={u.rank} style={{...card(u.demo&&u.name===user.name),marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
          <span style={{width:20,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:800,color:i<3?T.warn:T.muted}}>{u.rank}</span>
          <Av label={u.av} size={32} color={u.color}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:u.demo&&u.name===user.name?T.accent:T.text}}>{u.name}{u.demo&&u.name===user.name?" (You)":""}</div><RatingBadge r={u.demo&&u.name===user.name?rating:u.rating}/></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:800,color:T.warn}}>{u.score.toLocaleString()}</div><div style={{fontSize:10,color:u.chg>0?T.green:u.chg<0?T.accent2:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{u.chg>0?"+":""}{u.chg}</div></div>
        </div>
      </div>)}
    </div>
  </div>;

  const ContestsPanel=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
    <Topbar title="⚡ Contests" back={()=>setPanel(null)} noIcons/>
    <div style={{padding:"10px 12px"}}>
      {CONTESTS.map(c=>{const pm=PM[c.platform]||PM.hackernet;return <div key={c.id} style={{...card(c.status==="live"),marginBottom:10}}>
        <div style={{padding:12}}>
          <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>{c.status==="live"?<span style={tag(T.accent)}>● LIVE</span>:<span style={tag(T.muted)}>UPCOMING</span>}<PBadge platform={c.platform}/><span style={tag(T.warn)}>🏆 {c.prize}</span></div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{c.title}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:8}}>⏱ <b style={{color:T.accent,fontFamily:"'JetBrains Mono',monospace"}}>{c.status==="live"?timer1:c.ends||"2d"}</b> · 👥 {c.parts?.toLocaleString()}</div>
          <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>{c.tags.map(t=><span key={t} style={tag(T.accent3)}>{t}</span>)}</div>
          <div style={{display:"flex",gap:6}}>
            <button style={btn(c.status==="live"?"primary":"ghost","sm")} onClick={()=>{setPanel(null);setScreen("problems");}}>{c.status==="live"?"▶ Solve":"Register →"}</button>
            {c.url&&<a href={c.url} target="_blank" rel="noreferrer" style={{...btn("ghost","sm"),textDecoration:"none",display:"flex",alignItems:"center"}}>↗ {pm.label}</a>}
          </div>
        </div>
      </div>;})}
    </div>
  </div>;

  const MediaGallery=()=><div style={{position:"fixed",inset:0,background:T.bg,display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto"}}>
    <Topbar title="⊞ Media" back={()=>setPanel(null)} noIcons/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,padding:"2px"}}>
      {MEDIA_IMGS.map((img,i)=><div key={i} style={{aspectRatio:"1",overflow:"hidden",cursor:"zoom-in",borderRadius:3}} onClick={()=>setMediaModal(img)}><img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>)}
    </div>
  </div>;

  const IntegrationModal=()=>(
    <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:20,width:"100%",maxWidth:380,maxHeight:"80dvh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:14,fontWeight:700}}>⚙ Platform Integrations</span><button style={ib()} onClick={()=>setIModal(false)}>✕</button></div>
        {[["🐙","GitHub username","github"],["🟠","LeetCode username","lc"],["🔵","Codeforces handle","cf"],["🟤","CodeChef username","cc"]].map(([ic,label,key])=>(
          <div key={key} style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{ic} {label.toUpperCase()}</div><input style={inp} placeholder={label} value={iForm[key]||""} onChange={e=>setIForm(p=>({...p,[key]:e.target.value}))}/></div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:14}}><button style={{...btn("primary"),flex:1}} onClick={()=>{setIntegr(iForm);setIModal(false);}}>Save</button><button style={btn("ghost")} onClick={()=>setIModal(false)}>Cancel</button></div>
      </div>
    </div>
  );

  const EditProfilePanel=()=>{
    const [form,setForm]=useState({name:user?.name||"",bio:user?.bio||"",skill:""});
    const [skills,setSkills]=useState(user?.skills||[]);
    const COLORS=["#00e5ff","#ff2d78","#a855f7","#22c55e","#f59e0b","#f34b7d","#3178c6","#dea584"];
    const save=()=>{const updated={...user,...form,skills};setUser(updated);const all=DB.get("users",{});if(all[user.username])all[user.username]={...all[user.username],...form,skills};DB.set("users",all);setEditProfile(false);};
    return <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:20,width:"100%",maxWidth:380,maxHeight:"85dvh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:14,fontWeight:700}}>✏️ Edit Profile</span><button style={ib()} onClick={()=>setEditProfile(false)}>✕</button></div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>AVATAR COLOR</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(col=><div key={col} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",border:`3px solid ${user?.color===col?T.text:"transparent"}`,transition:"border .15s"}} onClick={()=>setUser(p=>({...p,color:col}))}/>)}</div></div>
        {[["DISPLAY NAME","name","e.g. 0xShoham"],["BIO","bio","Full-stack hacker..."]].map(([label,key,ph])=>(
          <div key={key} style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{label}</div>
            {key==="bio"?<textarea style={{...inp,minHeight:60,resize:"none"}} placeholder={ph} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>:<input style={inp} placeholder={ph} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>}
          </div>
        ))}
        <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>SKILLS</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{skills.map((s,i)=><span key={i} style={{...tag(T.accent3),cursor:"pointer"}} onClick={()=>setSkills(p=>p.filter((_,j)=>j!==i))}>{s} ✕</span>)}</div><div style={{display:"flex",gap:6}}><input style={{...inp,flex:1,fontSize:11}} placeholder="Add skill (Enter)" value={form.skill} onChange={e=>setForm(p=>({...p,skill:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&form.skill.trim()){setSkills(p=>[...p,form.skill.trim()]);setForm(p=>({...p,skill:""}));}}}/><button style={btn("primary","sm")} onClick={()=>{if(form.skill.trim()){setSkills(p=>[...p,form.skill.trim()]);setForm(p=>({...p,skill:""}));}}}>+</button></div></div>
        <button style={{...btn("primary"),width:"100%"}} onClick={save}>Save Changes</button>
      </div>
    </div>;
  };

  // ── RENDER ───────────────────────────────────────────────────
  const pages={feed:<FeedPage/>,explore:<ExplorePage/>,problems:<ProblemsPage/>,projects:<ProjectsPage/>,profile:<ProfilePage/>};
  const renderPanel=()=>{
    switch(panel){
      case "chat":       return <ChatPanel/>;
      case "problem":    return <ProblemPanel/>;
      case "code":       return <CodePanel/>;
      case "battle":     return <BattlePanel/>;
      case "ai":         return <AIPanel/>;
      case "notifs":     return <NotifsPanel/>;
      case "story":      return <StoryPanel/>;
      case "compose":    return <ComposePanel/>;
      case "groups":     return <GroupsPanel/>;
      case "leaderboard":return <LeaderboardPanel/>;
      case "contests":   return <ContestsPanel/>;
      case "media":      return <MediaGallery/>;
      default: return null;
    }
  };

  return <div style={{width:"100%",minHeight:"100dvh",display:"flex",flexDirection:"column",background:T.bg,color:T.text,fontFamily:"'Syne','Segoe UI',sans-serif",filter:glitch?"hue-rotate(12deg) brightness(1.1)":"none",transition:"background .3s,color .3s,filter .08s"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
      ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:${T.bg};}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
      button:active{transform:scale(0.95);}textarea,input{-webkit-appearance:none;}
      @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
      a{color:inherit;}
      .msg-item:hover .msg-actions{opacity:1!important;}
    `}</style>

    <StatusBar/>
    <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
      {pages[screen]||<FeedPage/>}
    </div>
    <Navbar/>

    {/* FABs */}
    {!panel&&<div style={{position:"fixed",bottom:72,right:14,display:"flex",flexDirection:"column",gap:8,zIndex:90}}>
      <button style={{width:42,height:42,borderRadius:"50%",background:T.accent,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",boxShadow:`0 0 16px ${T.accent}44`}} onClick={()=>setPanel("code")}>💻</button>
      <button style={{width:42,height:42,borderRadius:"50%",background:T.accent3,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",boxShadow:`0 0 16px ${T.accent3}44`}} onClick={()=>setPanel("chat")}>💬</button>
      <button style={{width:42,height:42,borderRadius:"50%",background:T.accent2,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",boxShadow:`0 0 16px ${T.accent2}44`}} onClick={()=>setPanel("contests")}>⚡</button>
    </div>}

    {/* Panels */}
    {renderPanel()}

    {/* Modals */}
    {iModal&&<IntegrationModal/>}
    {editProfile&&<EditProfilePanel/>}
    {mediaModal&&<div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setMediaModal(null)}><img src={mediaModal} alt="" style={{maxWidth:"94%",maxHeight:"80dvh",borderRadius:12,border:`2px solid ${T.border}`}}/><button style={{position:"absolute",top:20,right:20,background:"#ffffff22",border:"none",borderRadius:"50%",width:36,height:36,fontSize:18,cursor:"pointer",color:"#fff"}} onClick={()=>setMediaModal(null)}>✕</button></div>}

    {/* Badge toast */}
    {newBadge&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:T.surface,border:`2px solid ${T.warn}`,borderRadius:16,padding:"12px 20px",zIndex:500,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px #00000088",animation:"fadeUp .3s ease",whiteSpace:"nowrap"}}>
      <span style={{fontSize:28}}>{newBadge.icon}</span>
      <div><div style={{fontSize:11,color:T.warn,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>BADGE UNLOCKED!</div><div style={{fontSize:13,fontWeight:700}}>{newBadge.name}</div><div style={{fontSize:11,color:T.muted}}>{newBadge.desc}</div></div>
    </div>}

    {/* Click outside to close msg menu */}
    {msgMenuId&&<div style={{position:"fixed",inset:0,zIndex:40}} onClick={()=>setMsgMenuId(null)}/>}
  </div>;
}
