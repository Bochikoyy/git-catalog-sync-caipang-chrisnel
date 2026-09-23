Catalog Sync Workflow

Repository: git-catalog-sync-caipang-chrisnel
Contributor: Chrisnel Caipang
Commit Naming Convention: caipang.chrisnel

This exercise simulated three contributors independently modifying the same feature/late-fee-policy branch. Three separate local clones were used to demonstrate rejected pushes, merge conflicts, a stale third contributor, and finally conflict resolution through rebasing.

Task 1 - Clone A: Add a 1-Day Grace Period

Clone A modified calculateLateFee() so that a borrower does not receive a late fee when the book is late by one day or less.

The change was committed and successfully pushed to feature/late-fee-policy.

Task 2 - Clone B: Add Rounding and Encounter a Rejected Push

Clone B was created before Clone A pushed its grace-period change and intentionally did not fetch the latest remote changes.

Clone B changed the late-fee calculation from Math.floor() to Math.round(). After committing the change, the push was rejected because the remote branch already contained Clone A's newer commit.

This demonstrated a non-fast-forward push rejection caused by two contributors independently modifying the same shared branch.

Task 3 - Clone B: Merge the Grace Period and Rounding Changes

Clone B fetched the latest version of feature/late-fee-policy and merged it into its local branch.

Git reported conflicts in both catalog.js and test.js because Clone A and Clone B changed overlapping parts of the same files.

The conflict was manually resolved so that both behaviors survived:

A one-day grace period returns $0.
Late fees after the grace period use Math.round() instead of Math.floor().

The tests passed, the merge was committed, and the result was successfully pushed.

Task 4 - Clone C: Add a Maximum Fee Cap and Encounter Another Rejected Push

Clone C had also been created before any task work started and remained on the original state of the branch.

It introduced a maximum late fee of $20. Because Clone C had not fetched either Clone A's grace-period work or Clone B's merged rounding work, its attempt to push was rejected.

At this point, the remote feature branch had advanced through multiple commits while Clone C still had the original branch state.

Task 5 - Clone C: Reconcile All Three Contributors

Clone C fetched the updated remote branch and attempted to merge it.

The conflict was more complex because the final result needed to retain work originating from three contributors:

Clone A's one-day grace period.
Clone B's rounded fee calculation.
Clone C's $20 maximum fee cap.

The resolved implementation became:

function calculateLateFee(daysLate, ratePerDay) {
  if (daysLate <= 1) return 0;
  const fee = Math.round(daysLate * ratePerDay);
  return Math.min(fee, 20);
}

Tests were updated to verify all three behaviors. After all tests passed, the merge was committed and pushed.

Task 6 - Clone A: Add a $1 Minimum and Reconcile Through Rebase

Clone A had not fetched any of the work completed after Task 1. It independently added a $1 minimum late fee for borrowers who were already outside the grace period.

Its initial push was rejected because the remote branch now contained the merged work from Clones B and C.

Instead of performing another merge, Clone A fetched the latest remote branch and ran:

git rebase origin/feature/late-fee-policy

The rebase produced conflicts in both catalog.js and test.js.

The conflicts were resolved so that all four requirements survived:

function calculateLateFee(daysLate, ratePerDay) {
  if (daysLate <= 1) return 0;

  const fee = Math.round(daysLate * ratePerDay);

  return Math.max(1, Math.min(fee, 20));
}

After resolving the conflicts, the rebase was continued, all tests passed, and the branch was pushed normally without using a force push.

Task 7 - Merge into Main

The completed feature/late-fee-policy branch was merged into main.

The final implementation contained the grace period, rounding behavior, maximum fee, and minimum fee. The final tests passed and main was pushed to GitHub.

Written Questions
1. Walk through the final calculateLateFee function and name which contributor's change is responsible for each part.

The final function is:

function calculateLateFee(daysLate, ratePerDay) {
  if (daysLate <= 1) return 0;

  const fee = Math.round(daysLate * ratePerDay);

  return Math.max(1, Math.min(fee, 20));
}

The first condition:

if (daysLate <= 1) return 0;

came from Clone A's first contribution. It implements the one-day grace period so that borrowers who are one day late or less receive no late fee.

The calculation:

const fee = Math.round(daysLate * ratePerDay);

came from Clone B. The original program used Math.floor(), which truncated the result. Clone B changed this behavior so that the calculated fee is rounded to the nearest whole dollar.

The $20 maximum:

Math.min(fee, 20)

came from Clone C. It prevents the computed late fee from exceeding $20, regardless of how many days the item is overdue.

The $1 minimum:

Math.max(1, ...)

came from Clone A's second contribution in Task 6. It ensures that once a borrower is outside the grace period, the late fee cannot be lower than $1.

The grace-period check must happen before the minimum-fee calculation. Otherwise, applying the $1 minimum first could incorrectly charge a borrower during the grace period.

2. Compare Task 3's two-way conflict to Task 5's three-way conflict. What got harder with a third line of work?

In Task 3, the conflict involved two independently developed behaviors. Clone A added the grace period while Clone B changed the calculation from truncation to rounding.

The resolution was relatively simple because I only needed to identify one useful change from each side and combine them:

if (daysLate <= 1) return 0;
return Math.round(daysLate * ratePerDay);

Task 5 was harder because Clone C began from the original branch state while the remote branch already contained the reconciled work of both Clone A and Clone B.

Clone C's version still contained Math.floor(), while the remote version had already changed that behavior to Math.round(). At the same time, Clone C introduced a new $20 cap that still had to be preserved.

Therefore, I could not simply choose one side of the conflict. I had to understand which parts were stale and which parts represented new functionality. I kept the remote grace-period and rounding behavior, discarded the outdated Math.floor() behavior, and incorporated Clone C's $20 cap.

Although Git still technically performs a merge between two branch tips using their common ancestor, the human conflict-resolution problem involved accumulated work from three contributors.

3. What is the actual difference between how Task 5 was resolved with merge and how Task 6 was resolved with rebase?

In Task 5, I used a merge.

After fetching the latest remote branch, Git combined Clone C's divergent history with the existing remote history. Resolving the conflict and committing it produced a separate merge commit. Both lines of development remained visible in the repository history.

Conceptually, the history looked like divergent work joining together:

       C change
      /        \
base            merge
      \        /
       A + B work

In Task 6, I used a rebase instead.

Clone A's $1 minimum-fee commit had originally been created on top of an outdated version of the feature branch. Rebasing temporarily removed that local commit, moved Clone A to the latest remote feature branch, and then attempted to replay the $1 minimum-fee commit on top of the updated history.

The commit therefore received a new commit hash because its parent and resulting content changed.

Conceptually, the result became linear:

remote latest
     |
A's rebased $1 minimum commit

This is also why I could push normally after the successful rebase. The rebased branch was now a direct descendant of the current remote branch, allowing GitHub to perform a fast-forward update. No force push was necessary.

The main distinction is that merge preserves both divergent histories and adds a merge commit, while rebase rewrites the local commit so that it appears to have been created on top of the latest remote history.

4. If this were a real team of three, what one process change would have prevented all three rejected pushes?

Instead of having all three contributors push directly to the same feature/late-fee-policy branch, each contributor should work on their own short-lived branch and submit the change through a pull request.

For example:

feature/late-fee-grace
feature/late-fee-rounding
feature/late-fee-cap
feature/late-fee-minimum

Each contributor could safely push their own branch without competing with another person's remote branch tip. The changes could then be reviewed and integrated into feature/late-fee-policy one at a time.

This would avoid the repeated non-fast-forward rejected pushes caused by several people independently pushing directly to the same shared feature branch. Regularly fetching and rebasing before integration would further reduce conflicts, but separating contributor branches would directly prevent the rejected pushes demonstrated in this exercise.