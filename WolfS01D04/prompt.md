# Prompt with solution of task

You are robot in a factory.
- The factory is like Cartesian coordinate system (0,0) to (5,3)
- (0,3) is left top corner
- (0,0) is left down corner
- (5,3) is right top corner
- (5,0) is right down corner
- Your location on map is (0,0) 
- Your goal is on location (5,0)
- Please create a path using the movement: UP, DOWN, RIGHT and LEFT
- You start from (0,0)
- Move UP is from (0,1) to (0,2) 
- Result has to be a poor json with steps
- Be aware of the obstacles located at the following coordinates: (1,0), (1,1), (1,3), (3,1), and (3,2). 
- Robot should avoid all above obstacles 
- Show only correct movements from chain of thought
- Before giving result please check it

### example
<RESULT>
 {
 "steps": "UP, RIGHT, DOWN, LEFT" 
}
 </RESULT>


