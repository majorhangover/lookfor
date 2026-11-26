/**
 * Words for each occasion's own page (/christmas, /birthday ...): the browser
 * tab title, the search snippet, and the short paragraph under the app that
 * search engines read. "any" has no page of its own; it lives at "/".
 */
export interface OccasionPage {
  title: string;
  description: string;
  heading: string;
  text: string;
}

export const GENERAL_PAGE: OccasionPage = {
  title: "Lookfor: free Christmas gift ideas for family and friends",
  description:
    "Stuck for gift ideas? Tell Santa who you're buying for, what they love and your budget, and get personalised Christmas gift ideas for mum, dad, kids, grandparents and friends. Free, in seconds.",
  heading: "Free gift ideas for everyone you buy for",
  text: "Lookfor is a free gift finder. Tell our host who you're shopping for, what they're into and roughly what you want to spend, and get gift ideas you can buy online. Find presents for mum and dad, grandparents, children and teenagers, partners and friends, for Christmas, birthdays, Valentine's Day, Mother's Day, Father's Day, Easter, weddings, anniversaries, new babies and thank-yous.",
};

export const OCCASION_PAGES: Record<string, OccasionPage> = {
  christmas: {
    title: "Christmas gift ideas for family and friends",
    description:
      "Tell Santa who you're buying for, what they love and your budget, and get personalised Christmas gift ideas for mum, dad, kids, grandparents, Secret Santa and stocking fillers. Free, in seconds.",
    heading: "Free Christmas gift ideas for everyone on your list",
    text: "Stuck on what to buy this Christmas? Tell Santa who you're shopping for, what they're into and roughly what you want to spend, and he'll pop ideas under the tree in seconds. Find Christmas presents for mum and dad, grandparents, children and teenagers, partners and friends, plus Secret Santa gifts, stocking fillers and last-minute ideas.",
  },
  birthday: {
    title: "Birthday gift ideas for every age",
    description:
      "Tell Bella whose birthday it is, what they love and your budget, and get personalised birthday present ideas for kids, teens, adults and milestone birthdays. Free, in seconds.",
    heading: "Free birthday gift ideas, from first birthdays to big milestones",
    text: "Whose birthday is coming up? Tell Bella who it's for, when it is, what they love and your budget, and she'll suggest birthday presents that suit them. Find ideas for children and teenagers, mum and dad, grandparents, partners and friends, and for milestone birthdays like 18th, 21st, 30th, 40th, 50th and 60th. Save their birthday in My people and Lookfor will flag it when it's coming round again.",
  },
  valentines: {
    title: "Valentine's Day gift ideas for him and her",
    description:
      "Tell Rosa about your partner and your budget, and get thoughtful, personalised Valentine's Day gift ideas for him or her. Free, in seconds.",
    heading: "Free Valentine's Day gift ideas",
    text: "Want to get Valentine's Day right? Tell Rosa about the person you love, what they enjoy and what you'd like to spend, and she'll suggest romantic and thoughtful gifts. Find Valentine's ideas for him and for her, for new relationships and long-term partners, from small tokens to special treats and experiences.",
  },
  anniversary: {
    title: "Anniversary gift ideas by year",
    description:
      "Tell Henry which anniversary it is, and get personalised anniversary gift ideas, from paper and cotton to silver, ruby and gold. Free, in seconds.",
    heading: "Free anniversary gift ideas for every year",
    text: "Celebrating years together? Tell Henry whose anniversary it is and how many years, and he'll suggest gifts that fit, with a nod to the traditional themes: paper for the first, cotton for the second, leather for the third, then tin, silver, ruby, gold and more. Find anniversary gifts for your partner, your parents or friends.",
  },
  easter: {
    title: "Easter gift ideas beyond chocolate",
    description:
      "Tell Daisy who you're treating this Easter, and get personalised Easter gift ideas for kids and grown-ups, from treats to spring activities. Free, in seconds.",
    heading: "Free Easter gift ideas",
    text: "Looking for something a little different this Easter? Tell Daisy who you're treating and what they like, and she'll suggest Easter gifts for children and grown-ups alike: treats, baskets and hampers, chocolate alternatives, spring and garden ideas, and things to make and do over the holidays.",
  },
  "mothers-day": {
    title: "Mother's Day gift ideas for mum, gran and more",
    description:
      "Tell Maggie about the mum in your life, and get personalised Mother's Day gift ideas for mums, step-mums, grans and mother figures. Free, in seconds.",
    heading: "Free Mother's Day gift ideas",
    text: "Want to spoil a special mum? Tell Maggie who she is, what she loves and your budget, and she'll suggest Mother's Day gifts that feel personal. Find ideas for mum, step-mum, gran, mother-in-law and the mother figures in your life, from pampering treats and keepsakes to hobbies and days out.",
  },
  "fathers-day": {
    title: "Father's Day gift ideas for dad, grandad and more",
    description:
      "Tell Barney about the dad in your life, and get personalised Father's Day gift ideas for dads, step-dads, grandads and father figures. Free, in seconds.",
    heading: "Free Father's Day gift ideas",
    text: "Stuck on what to get Dad? Tell Barney what he's into and what you'd like to spend, and he'll suggest Father's Day gifts he'll actually use. Find ideas for dad, step-dad, grandad, father-in-law and the father figures in your life, from gadgets and hobbies to food, drink and experiences.",
  },
  wedding: {
    title: "Wedding gift ideas for the happy couple",
    description:
      "Tell Darcy about the couple, and get personalised wedding gift ideas, on or off the gift list, plus gifts for the wedding party. Free, in seconds.",
    heading: "Free wedding gift ideas",
    text: "Going to a wedding? Tell Darcy about the happy couple, when the big day is and your budget, and she'll suggest wedding gifts they'll treasure, whether you're buying alongside a gift list or going your own way. Find ideas for the couple, for bridesmaids, best men and the wedding party, and for engagements too.",
  },
  "new-baby": {
    title: "New baby gift ideas for babies and new parents",
    description:
      "Tell Stella about the new arrival, and get personalised new baby gift ideas, from practical essentials to keepsakes and treats for the parents. Free, in seconds.",
    heading: "Free new baby gift ideas",
    text: "Congratulating new parents? Tell Stella whether the baby has arrived or when it's due, and she'll suggest new baby gifts: practical things parents really need, keepsakes to treasure, and a little something for mum and dad. Great for baby showers, christenings and naming days too.",
  },
  "thank-you": {
    title: "Thank you gift ideas for teachers, hosts and helpers",
    description:
      "Tell Finn who you'd like to thank, and get personalised thank you gift ideas for teachers, hosts, neighbours and colleagues. Free, in seconds.",
    heading: "Free thank you gift ideas",
    text: "Want to say thank you with a gift? Tell Finn who helped out and what you'd like to spend, and he'll suggest thoughtful thank you gifts for teachers and nursery staff, hosts, neighbours, colleagues, carers and anyone who's gone the extra mile.",
  },
};

/** The web address for an occasion: its own page, or the home page for "any". */
export function occasionPath(id: string): string {
  return OCCASION_PAGES[id] ? `/${id}` : "/";
}
